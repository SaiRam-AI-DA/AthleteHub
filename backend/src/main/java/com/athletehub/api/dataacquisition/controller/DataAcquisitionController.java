package com.athletehub.api.dataacquisition.controller;

import com.athletehub.api.dataacquisition.dto.ImportPreviewResponse;
import com.athletehub.api.dataacquisition.parser.CsvDatasetParser;
import com.athletehub.api.dataacquisition.service.DatasetImportService;
import com.athletehub.api.entity.ImportJob;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@RestController
@RequestMapping("/api/v1/data-acquisition")
@CrossOrigin(origins = "*")
public class DataAcquisitionController {

    private final DatasetImportService importService;

    public DataAcquisitionController(DatasetImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/preview")
    public ResponseEntity<Object> previewImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("profile") String profile) {
        try {
            // For now, always assume CSV. In the future, parse extension.
            try (CsvDatasetParser parser = new CsvDatasetParser()) {
                parser.initialize(file.getInputStream());
                ImportPreviewResponse response = importService.previewImport(parser, profile, 100);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            java.util.Map<String, String> errorResp = new java.util.HashMap<>();
            errorResp.put("error", e.getClass().getName());
            errorResp.put("message", e.getMessage() != null ? e.getMessage() : "null");
            
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            errorResp.put("trace", sw.toString());
            
            return ResponseEntity.status(500).body(errorResp);
        }
    }

    @PostMapping("/import")
    public ResponseEntity<ImportJob> executeImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("profile") String profile) {
        try {
            try (CsvDatasetParser parser = new CsvDatasetParser()) {
                parser.initialize(file.getInputStream());
                ImportJob job = importService.executeImport(parser, profile, file.getOriginalFilename());
                return ResponseEntity.ok(job);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<java.util.List<ImportJob>> getImportHistory() {
        return ResponseEntity.ok(importService.getImportHistory());
    }
}
