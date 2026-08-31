package com.athletehub.api.service.impl;

import com.athletehub.api.dto.TrainingAttendanceDTO;
import com.athletehub.api.dto.TrainingAttendanceMapper;
import com.athletehub.api.dto.TrainingAttendanceRequest;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.TrainingAttendance;
import com.athletehub.api.entity.TrainingSession;
import com.athletehub.api.entity.enums.AttendanceStatus;
import com.athletehub.api.entity.enums.TrainingSessionStatus;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.TrainingAttendanceRepository;
import com.athletehub.api.repository.TrainingSessionRepository;
import com.athletehub.api.service.TrainingAttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class TrainingAttendanceServiceImpl implements TrainingAttendanceService {

    @Autowired
    private TrainingAttendanceRepository trainingAttendanceRepository;

    @Autowired
    private TrainingSessionRepository trainingSessionRepository;

    @Autowired
    private AthleteRepository athleteRepository;

    @Autowired
    private TrainingAttendanceMapper trainingAttendanceMapper;

    @Override
    @Transactional
    public TrainingAttendanceDTO recordAttendance(TrainingAttendanceRequest request) {
        TrainingSession session = trainingSessionRepository.findById(request.getTrainingSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Training Session not found"));

        if (session.getStatus() == TrainingSessionStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled sessions cannot record attendance");
        }

        Athlete athlete = athleteRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));

        if (!session.getCoachAssignment().getAthlete().getId().equals(athlete.getId())) {
            throw new IllegalArgumentException("Athlete must belong to the assigned Coach for this session");
        }

        Optional<TrainingAttendance> existing = trainingAttendanceRepository.findByTrainingSessionIdAndAthleteId(session.getId(), athlete.getId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Attendance cannot be submitted twice for the same athlete and session. Update existing record instead.");
        }

        TrainingAttendance attendance = new TrainingAttendance();
        attendance.setTrainingSession(session);
        attendance.setAthlete(athlete);
        attendance.setAttendanceStatus(AttendanceStatus.valueOf(request.getAttendanceStatus().toUpperCase()));
        attendance.setCoachNotes(request.getCoachNotes());
        attendance.setAthleteFeedback(request.getAthleteFeedback());
        attendance.setInjuryReport(request.getInjuryReport());

        // Save to get ID
        TrainingAttendance savedAttendance = trainingAttendanceRepository.save(attendance);
        
        // Generate code
        savedAttendance.setAttendanceCode("ATD" + String.format("%06d", savedAttendance.getId()));
        savedAttendance = trainingAttendanceRepository.save(savedAttendance);
        
        return trainingAttendanceMapper.toDTO(savedAttendance);
    }

    @Override
    @Transactional
    public TrainingAttendanceDTO updateAttendance(Integer id, TrainingAttendanceRequest request) {
        TrainingAttendance attendance = trainingAttendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));

        if (request.getAttendanceStatus() != null) {
            attendance.setAttendanceStatus(AttendanceStatus.valueOf(request.getAttendanceStatus().toUpperCase()));
        }
        if (request.getCoachNotes() != null) attendance.setCoachNotes(request.getCoachNotes());
        if (request.getAthleteFeedback() != null) attendance.setAthleteFeedback(request.getAthleteFeedback());
        if (request.getInjuryReport() != null) attendance.setInjuryReport(request.getInjuryReport());

        return trainingAttendanceMapper.toDTO(trainingAttendanceRepository.save(attendance));
    }

    @Override
    public TrainingAttendanceDTO getAttendanceById(Integer id) {
        TrainingAttendance attendance = trainingAttendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));
        return trainingAttendanceMapper.toDTO(attendance);
    }

    @Override
    public Page<TrainingAttendanceDTO> getAttendanceBySessionId(Integer sessionId, Pageable pageable) {
        return trainingAttendanceRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("trainingSession").get("id"), sessionId),
                pageable
        ).map(trainingAttendanceMapper::toDTO);
    }

    @Override
    public Page<TrainingAttendanceDTO> getAttendanceByAthleteId(Integer athleteId, Pageable pageable) {
        return trainingAttendanceRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("athlete").get("id"), athleteId),
                pageable
        ).map(trainingAttendanceMapper::toDTO);
    }
}
