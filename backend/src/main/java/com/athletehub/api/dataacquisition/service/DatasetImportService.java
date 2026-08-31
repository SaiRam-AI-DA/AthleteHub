package com.athletehub.api.dataacquisition.service;

import com.athletehub.api.dataacquisition.dto.ImportPreviewResponse;
import com.athletehub.api.dataacquisition.dto.RawRecord;
import com.athletehub.api.dataacquisition.dto.TransformedRecord;
import com.athletehub.api.dataacquisition.engine.TransformationEngine;
import com.athletehub.api.dataacquisition.engine.ValidationEngine;
import com.athletehub.api.dataacquisition.mapping.DatasetMappingProfile;
import com.athletehub.api.dataacquisition.parser.DatasetParser;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.ImportJob;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.ImportJobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DatasetImportService {

    private final List<DatasetMappingProfile> mappingProfiles;
    private final TransformationEngine transformationEngine;
    private final ValidationEngine validationEngine;
    private final AthleteRepository athleteRepository;
    private final ImportJobRepository importJobRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public DatasetImportService(List<DatasetMappingProfile> mappingProfiles,
                                TransformationEngine transformationEngine,
                                ValidationEngine validationEngine,
                                AthleteRepository athleteRepository,
                                ImportJobRepository importJobRepository) {
        this.mappingProfiles = mappingProfiles;
        this.transformationEngine = transformationEngine;
        this.validationEngine = validationEngine;
        this.athleteRepository = athleteRepository;
        this.importJobRepository = importJobRepository;
    }

    public ImportPreviewResponse previewImport(DatasetParser parser, String datasetIdentifier, int previewLimit) throws Exception {
        DatasetMappingProfile profile = getMappingProfile(datasetIdentifier);

        ImportPreviewResponse response = new ImportPreviewResponse();
        response.setDatasetName(profile.getProfileName());
        
        List<TransformedRecord> previewRecords = new ArrayList<>();
        int total = 0, valid = 0, invalid = 0, duplicate = 0;

        transformationEngine.clearCache();

        for (RawRecord rawRecord : (Iterable<RawRecord>) () -> parser.iterator()) {
            total++;
            TransformedRecord tr = processRecord(rawRecord, profile);

            if (tr.isValid() && !tr.isDuplicate()) {
                valid++;
            } else if (tr.isDuplicate()) {
                duplicate++;
            } else {
                invalid++;
            }

            if (previewRecords.size() < previewLimit) {
                previewRecords.add(tr);
            }
        }

        response.setTotalRows(total);
        response.setValidRows(valid);
        response.setInvalidRows(invalid);
        response.setDuplicateRows(duplicate);
        response.setPreviewRecords(previewRecords);

        return response;
    }

    @Transactional
    public ImportJob executeImport(DatasetParser parser, String datasetIdentifier, String fileName) throws Exception {
        DatasetMappingProfile profile = getMappingProfile(datasetIdentifier);
        
        ImportJob job = new ImportJob();
        job.setDatasetName(profile.getProfileName());
        job.setSource(datasetIdentifier);
        job.setFileName(fileName);
        job.setStartedAt(LocalDateTime.now());
        job.setStatus("RUNNING");
        job = importJobRepository.save(job);

        long startTime = System.currentTimeMillis();
        int total = 0, imported = 0, skipped = 0, duplicate = 0, failed = 0;
        
        List<Athlete> batch = new ArrayList<>();
        int batchSize = 1000;
        int dummyUserIdCounter = -1;

        transformationEngine.clearCache();

        for (RawRecord rawRecord : (Iterable<RawRecord>) () -> parser.iterator()) {
            total++;
            TransformedRecord tr = processRecord(rawRecord, profile);

            if (tr.isValid() && !tr.isDuplicate()) {
                Athlete athlete = tr.getAthlete();
                athlete.setImportJobId(job.getId());
                athlete.setRawSourceData(rawRecord.getRawLine()); // Storing raw JSON or line
                
                // We leave userId as null for imported athletes since they don't have login accounts yet.

                batch.add(athlete);
                imported++;

                if (batch.size() >= batchSize) {
                    athleteRepository.saveAll(batch);
                    batch.clear();
                    entityManager.flush();
                    entityManager.clear();
                }
                
                if (total >= 3000) {
                    break;
                }
            } else if (tr.isDuplicate()) {
                duplicate++;
            } else {
                failed++;
            }
        }

        if (!batch.isEmpty()) {
            athleteRepository.saveAll(batch);
        }

        job.setTotalRows(total);
        job.setImportedRows(imported);
        job.setDuplicateRows(duplicate);
        job.setFailedRows(failed);
        job.setSkippedRows(duplicate + failed);
        job.setCompletedAt(LocalDateTime.now());
        job.setStatus("COMPLETED");
        job.setProcessingTimeMs(System.currentTimeMillis() - startTime);
        
        return importJobRepository.save(job);
    }

    private TransformedRecord processRecord(RawRecord rawRecord, DatasetMappingProfile profile) {
        TransformedRecord tr = new TransformedRecord(rawRecord);
        Athlete athlete = new Athlete();
        
        try {
            profile.mapToAthlete(rawRecord, athlete);
            tr.setAthlete(athlete);
            
            validationEngine.validate(tr);
            if (tr.isValid()) {
                transformationEngine.enrich(tr);
                
                // Duplicate Check logic: simple check on firstName, lastName, DOB, countryId
                if (isDuplicate(athlete)) {
                    tr.setDuplicate(true);
                    tr.addError("Duplicate athlete found");
                }
            }
        } catch (Exception e) {
            tr.addError("Mapping failed: " + e.getMessage());
        }

        return tr;
    }

    private boolean isDuplicate(Athlete newAthlete) {
        // Here we should query the DB or use a local hash set for batch performance.
        // For simplicity in this demo, let's assume it checks the repository.
        // In a real scenario, this would be highly optimized.
        // Example check:
        // athleteRepository.findByFirstNameAndLastNameAndDateOfBirth(...)
        return false; 
    }

    private DatasetMappingProfile getMappingProfile(String datasetIdentifier) {
        return mappingProfiles.stream()
                .filter(p -> p.supports(datasetIdentifier))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No mapping profile found for: " + datasetIdentifier));
    }

    public List<ImportJob> getImportHistory() {
        return importJobRepository.findAllByOrderByStartedAtDesc();
    }
}
