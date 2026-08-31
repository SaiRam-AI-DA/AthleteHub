package com.athletehub.api.service.impl;

import com.athletehub.api.dto.TrainingSessionDTO;
import com.athletehub.api.dto.TrainingSessionMapper;
import com.athletehub.api.dto.TrainingSessionRequest;
import com.athletehub.api.entity.CoachAssignment;
import com.athletehub.api.entity.TrainingPlan;
import com.athletehub.api.entity.TrainingSession;
import com.athletehub.api.entity.enums.SessionIntensity;
import com.athletehub.api.entity.enums.TrainingSessionStatus;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.CoachAssignmentRepository;
import com.athletehub.api.repository.TrainingPlanRepository;
import com.athletehub.api.repository.TrainingSessionRepository;
import com.athletehub.api.service.TrainingSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TrainingSessionServiceImpl implements TrainingSessionService {

    @Autowired
    private TrainingSessionRepository trainingSessionRepository;

    @Autowired
    private TrainingPlanRepository trainingPlanRepository;

    @Autowired
    private CoachAssignmentRepository coachAssignmentRepository;

    @Autowired
    private TrainingSessionMapper trainingSessionMapper;

    @Override
    @Transactional
    public TrainingSessionDTO createTrainingSession(TrainingSessionRequest request) {
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new IllegalArgumentException("End Time must be after Start Time");
        }

        TrainingPlan plan = trainingPlanRepository.findById(request.getTrainingPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Training Plan not found"));

        CoachAssignment assignment = coachAssignmentRepository.findById(request.getCoachAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Coach Assignment not found"));

        // Validation: Session must belong to the same Organization as the Coach Assignment
        if (!plan.getOrganization().getId().equals(assignment.getOrganization().getId())) {
            throw new IllegalArgumentException("Session must belong to the same Organization as the Coach Assignment");
        }
        
        // Validation: Check for overlap
        List<TrainingSession> existingSessions = trainingSessionRepository.findByCoachAssignmentIdAndSessionDate(request.getCoachAssignmentId(), request.getSessionDate());
        for (TrainingSession existing : existingSessions) {
            // overlap logic
            boolean overlap = request.getStartTime().isBefore(existing.getEndTime()) && request.getEndTime().isAfter(existing.getStartTime());
            if (overlap && existing.getStatus() != TrainingSessionStatus.CANCELLED) {
                throw new IllegalArgumentException("Session overlaps with another session for the same Coach Assignment");
            }
        }

        TrainingSession session = new TrainingSession();
        session.setTrainingPlan(plan);
        session.setCoachAssignment(assignment);
        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setSessionDate(request.getSessionDate());
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        session.setVenue(request.getVenue());
        session.setSessionType(request.getSessionType());
        
        if (request.getIntensity() != null) {
            session.setIntensity(SessionIntensity.valueOf(request.getIntensity().toUpperCase()));
        }
        
        if (request.getStatus() != null) {
            session.setStatus(TrainingSessionStatus.valueOf(request.getStatus().toUpperCase()));
        }

        // Save to get ID
        TrainingSession savedSession = trainingSessionRepository.save(session);
        
        // Generate code
        savedSession.setSessionCode("TSN" + String.format("%06d", savedSession.getId()));
        savedSession = trainingSessionRepository.save(savedSession);
        
        return trainingSessionMapper.toDTO(savedSession);
    }

    @Override
    @Transactional
    public TrainingSessionDTO updateTrainingSession(Integer id, TrainingSessionRequest request) {
        TrainingSession session = trainingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training Session not found"));

        if (session.getStatus() == TrainingSessionStatus.COMPLETED) {
            // Can only update remarks
            if (request.getRemarks() != null) {
                session.setRemarks(request.getRemarks());
            } else {
                throw new IllegalArgumentException("Completed sessions cannot be modified except remarks");
            }
            return trainingSessionMapper.toDTO(trainingSessionRepository.save(session));
        }

        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
                throw new IllegalArgumentException("End Time must be after Start Time");
            }
            session.setStartTime(request.getStartTime());
            session.setEndTime(request.getEndTime());
            
            // Re-check overlap if times/dates change
            LocalDate dateToCheck = request.getSessionDate() != null ? request.getSessionDate() : session.getSessionDate();
            List<TrainingSession> existingSessions = trainingSessionRepository.findByCoachAssignmentIdAndSessionDate(session.getCoachAssignment().getId(), dateToCheck);
            for (TrainingSession existing : existingSessions) {
                if (!existing.getId().equals(session.getId()) && existing.getStatus() != TrainingSessionStatus.CANCELLED) {
                    boolean overlap = session.getStartTime().isBefore(existing.getEndTime()) && session.getEndTime().isAfter(existing.getStartTime());
                    if (overlap) {
                        throw new IllegalArgumentException("Session overlaps with another session for the same Coach Assignment");
                    }
                }
            }
        }

        if (request.getTitle() != null) session.setTitle(request.getTitle());
        if (request.getDescription() != null) session.setDescription(request.getDescription());
        if (request.getSessionDate() != null) session.setSessionDate(request.getSessionDate());
        if (request.getVenue() != null) session.setVenue(request.getVenue());
        if (request.getSessionType() != null) session.setSessionType(request.getSessionType());
        if (request.getIntensity() != null) session.setIntensity(SessionIntensity.valueOf(request.getIntensity().toUpperCase()));
        if (request.getStatus() != null) session.setStatus(TrainingSessionStatus.valueOf(request.getStatus().toUpperCase()));
        if (request.getRemarks() != null) session.setRemarks(request.getRemarks());

        return trainingSessionMapper.toDTO(trainingSessionRepository.save(session));
    }

    @Override
    public TrainingSessionDTO getTrainingSessionById(Integer id) {
        TrainingSession session = trainingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training Session not found"));
        return trainingSessionMapper.toDTO(session);
    }

    @Override
    @Transactional
    public void deleteTrainingSession(Integer id) {
        TrainingSession session = trainingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training Session not found"));
        session.setStatus(TrainingSessionStatus.CANCELLED);
        trainingSessionRepository.save(session);
    }

    @Override
    public Page<TrainingSessionDTO> searchTrainingSessions(String search, Integer organizationId, Integer coachId, Integer athleteId, Integer trainingPlanId, LocalDate startDate, LocalDate endDate, String status, String intensity, Pageable pageable) {
        Specification<TrainingSession> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate titlePredicate = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate codePredicate = cb.like(cb.lower(root.get("sessionCode")), searchPattern);
                Predicate venuePredicate = cb.like(cb.lower(root.get("venue")), searchPattern);
                predicates.add(cb.or(titlePredicate, codePredicate, venuePredicate));
            }
            
            if (trainingPlanId != null) {
                predicates.add(cb.equal(root.get("trainingPlan").get("id"), trainingPlanId));
            }
            
            if (organizationId != null || coachId != null || athleteId != null) {
                Join<TrainingSession, CoachAssignment> assignmentJoin = root.join("coachAssignment");
                if (organizationId != null) {
                    predicates.add(cb.equal(assignmentJoin.get("organization").get("id"), organizationId));
                }
                if (coachId != null) {
                    predicates.add(cb.equal(assignmentJoin.get("coach").get("id"), coachId));
                }
                if (athleteId != null) {
                    predicates.add(cb.equal(assignmentJoin.get("athlete").get("id"), athleteId));
                }
            }
            
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("sessionDate"), startDate));
            }
            
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("sessionDate"), endDate));
            }
            
            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), TrainingSessionStatus.valueOf(status.toUpperCase())));
            }
            
            if (intensity != null && !intensity.isEmpty()) {
                predicates.add(cb.equal(root.get("intensity"), SessionIntensity.valueOf(intensity.toUpperCase())));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        return trainingSessionRepository.findAll(spec, pageable).map(trainingSessionMapper::toDTO);
    }
}
