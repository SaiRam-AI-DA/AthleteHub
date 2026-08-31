package com.athletehub.api.service;

import com.athletehub.api.dto.recruitment.*;
import com.athletehub.api.entity.*;
import com.athletehub.api.entity.enums.RecruitmentStage;
import com.athletehub.api.repository.*;
import com.athletehub.api.dto.AthleteResponseDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

@Service
public class RecruitmentService {

    private final RecruitmentProspectRepository prospectRepository;
    private final RecruitmentNoteRepository noteRepository;
    private final RecruitmentShortlistRepository shortlistRepository;
    private final RecruitmentShortlistAthleteRepository shortlistAthleteRepository;
    private final RecruitmentTimelineRepository timelineRepository;
    private final RecruitmentTaskRepository taskRepository;
    private final AthleteRepository athleteRepository;
    private final UserRepository userRepository;

    public RecruitmentService(
            RecruitmentProspectRepository prospectRepository,
            RecruitmentNoteRepository noteRepository,
            RecruitmentShortlistRepository shortlistRepository,
            RecruitmentShortlistAthleteRepository shortlistAthleteRepository,
            RecruitmentTimelineRepository timelineRepository,
            RecruitmentTaskRepository taskRepository,
            AthleteRepository athleteRepository,
            UserRepository userRepository) {
        this.prospectRepository = prospectRepository;
        this.noteRepository = noteRepository;
        this.shortlistRepository = shortlistRepository;
        this.shortlistAthleteRepository = shortlistAthleteRepository;
        this.timelineRepository = timelineRepository;
        this.taskRepository = taskRepository;
        this.athleteRepository = athleteRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public RecruitmentDashboardDTO getDashboardMetrics(Integer recruiterId) {
        RecruitmentDashboardDTO metrics = new RecruitmentDashboardDTO();
        metrics.setTotalProspects(prospectRepository.countByRecruiterId(recruiterId));
        
        long activeCount = prospectRepository.countByRecruiterId(recruiterId) -
                prospectRepository.countByRecruiterIdAndStage(recruiterId, RecruitmentStage.REJECTED) -
                prospectRepository.countByRecruiterIdAndStage(recruiterId, RecruitmentStage.SELECTED);
        metrics.setActivePipeline(activeCount);
        
        metrics.setShortlistedAthletes(prospectRepository.countByRecruiterIdAndStage(recruiterId, RecruitmentStage.SHORTLISTED));
        metrics.setSelectedAthletes(prospectRepository.countByRecruiterIdAndStage(recruiterId, RecruitmentStage.SELECTED));
        metrics.setRejectedAthletes(prospectRepository.countByRecruiterIdAndStage(recruiterId, RecruitmentStage.REJECTED));
        
        metrics.setUpcomingTrials(taskRepository.findByRecruiterIdAndStatusNotAndDueDateBefore(recruiterId, "COMPLETED", LocalDate.now().plusDays(7)).stream().filter(t -> t.getTitle().toLowerCase().contains("trial")).count());
        metrics.setOverdueTasks(taskRepository.findByRecruiterIdAndStatusNotAndDueDateBefore(recruiterId, "COMPLETED", LocalDate.now()).size());
        
        return metrics;
    }

    @Transactional(readOnly = true)
    public List<RecruitmentProspectDTO> getProspects(Integer recruiterId) {
        return prospectRepository.findByRecruiterId(recruiterId).stream()
                .map(this::mapToProspectDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AthleteResponseDTO> discoverAthletes(Integer sportId, Integer minAge, Integer maxAge, Integer minRating) {
        Specification<Athlete> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.notEqual(root.get("status"), "Deleted"));

            if (sportId != null) {
                predicates.add(cb.equal(root.get("sport").get("id"), sportId));
            }
            if (minAge != null) {
                LocalDate maxDOB = LocalDate.now().minusYears(minAge);
                predicates.add(cb.lessThanOrEqualTo(root.get("dateOfBirth"), maxDOB));
            }
            if (maxAge != null) {
                LocalDate minDOB = LocalDate.now().minusYears(maxAge + 1);
                predicates.add(cb.greaterThan(root.get("dateOfBirth"), minDOB));
            }
            if (minRating != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("performanceRating"), minRating));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return athleteRepository.findAll(spec).stream()
                .map(this::mapToAthleteDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public RecruitmentProspectDTO addProspect(Integer athleteId, Integer recruiterId, Integer organizationId) {
        Athlete athlete = athleteRepository.findById(athleteId).orElseThrow();
        User recruiter = userRepository.findById(recruiterId).orElseThrow();
        Organization org = new Organization();
        org.setId(organizationId);

        RecruitmentProspect prospect = new RecruitmentProspect();
        prospect.setAthlete(athlete);
        prospect.setRecruiter(recruiter);
        prospect.setOrganization(org);
        prospect.setStage(RecruitmentStage.NEW_PROSPECT);
        prospect = prospectRepository.save(prospect);

        logTimeline(prospect, recruiter, "PROSPECT_CREATED", "Added athlete to recruitment pipeline.");
        return mapToProspectDTO(prospect);
    }

    @Transactional
    public RecruitmentProspectDTO updateProspectStage(Integer prospectId, RecruitmentStage newStage, Integer recruiterId) {
        RecruitmentProspect prospect = prospectRepository.findById(prospectId).orElseThrow();
        prospect.setStage(newStage);
        prospect = prospectRepository.save(prospect);

        User recruiter = userRepository.findById(recruiterId).orElseThrow();
        logTimeline(prospect, recruiter, "STAGE_CHANGED", "Moved to " + newStage.name());

        return mapToProspectDTO(prospect);
    }

    // Shortlists
    @Transactional(readOnly = true)
    public List<RecruitmentShortlistDTO> getShortlists(Integer recruiterId) {
        return shortlistRepository.findByRecruiterId(recruiterId).stream().map(s -> {
            RecruitmentShortlistDTO dto = new RecruitmentShortlistDTO();
            dto.setId(s.getId());
            dto.setName(s.getName());
            dto.setRecruiterId(s.getRecruiter().getId());
            dto.setCreatedAt(s.getCreatedAt());
            dto.setAthletes(shortlistAthleteRepository.findByShortlistId(s.getId()).stream()
                    .map(sa -> mapToAthleteDTO(sa.getAthlete()))
                    .collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void addAthleteToShortlist(Integer shortlistId, Integer athleteId) {
        RecruitmentShortlist shortlist = shortlistRepository.findById(shortlistId).orElseThrow();
        Athlete athlete = athleteRepository.findById(athleteId).orElseThrow();
        
        RecruitmentShortlistAthlete sa = new RecruitmentShortlistAthlete();
        sa.setShortlist(shortlist);
        sa.setAthlete(athlete);
        shortlistAthleteRepository.save(sa);
    }

    // Timeline Logging
    public void logTimeline(RecruitmentProspect prospect, User recruiter, String actionType, String details) {
        RecruitmentTimeline timeline = new RecruitmentTimeline();
        timeline.setProspect(prospect);
        timeline.setRecruiter(recruiter);
        timeline.setActionType(actionType);
        timeline.setDetails(details);
        timelineRepository.save(timeline);
    }

    // Mappers
    private RecruitmentProspectDTO mapToProspectDTO(RecruitmentProspect p) {
        RecruitmentProspectDTO dto = new RecruitmentProspectDTO();
        dto.setId(p.getId());
        dto.setRecruiterId(p.getRecruiter().getId());
        dto.setOrganizationId(p.getOrganization().getId());
        dto.setStage(p.getStage().name());
        dto.setRating(p.getRating());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        dto.setAthlete(mapToAthleteDTO(p.getAthlete()));
        return dto;
    }

    private AthleteResponseDTO mapToAthleteDTO(Athlete athlete) {
        AthleteResponseDTO dto = new AthleteResponseDTO();
        BeanUtils.copyProperties(athlete, dto);
        return dto;
    }

    // Notes
    @Transactional(readOnly = true)
    public List<RecruitmentNoteDTO> getNotes(Integer prospectId) {
        return noteRepository.findByProspectIdOrderByCreatedAtDesc(prospectId).stream().map(n -> {
            RecruitmentNoteDTO dto = new RecruitmentNoteDTO();
            dto.setId(n.getId());
            dto.setProspectId(n.getProspect().getId());
            dto.setRecruiterId(n.getRecruiter().getId());
            dto.setRecruiterName(n.getRecruiter().getFullName());
            dto.setNoteText(n.getNoteText());
            dto.setRating(n.getRating());
            dto.setCreatedAt(n.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public RecruitmentNoteDTO addNote(Integer prospectId, Integer recruiterId, String noteText, Integer rating) {
        RecruitmentProspect prospect = prospectRepository.findById(prospectId).orElseThrow();
        User recruiter = userRepository.findById(recruiterId).orElseThrow();
        
        RecruitmentNote note = new RecruitmentNote();
        note.setProspect(prospect);
        note.setRecruiter(recruiter);
        note.setNoteText(noteText);
        note.setRating(rating);
        note = noteRepository.save(note);
        
        logTimeline(prospect, recruiter, "NOTE_ADDED", "Added a note");
        
        RecruitmentNoteDTO dto = new RecruitmentNoteDTO();
        dto.setId(note.getId());
        dto.setProspectId(prospect.getId());
        dto.setRecruiterId(recruiter.getId());
        dto.setRecruiterName(recruiter.getFullName());
        dto.setNoteText(note.getNoteText());
        dto.setRating(note.getRating());
        dto.setCreatedAt(note.getCreatedAt());
        return dto;
    }

    // Tasks
    @Transactional(readOnly = true)
    public List<RecruitmentTaskDTO> getTasks(Integer recruiterId) {
        return taskRepository.findByRecruiterId(recruiterId).stream().map(this::mapToTaskDTO).collect(Collectors.toList());
    }

    @Transactional
    public RecruitmentTaskDTO addTask(RecruitmentTaskDTO request, Integer recruiterId) {
        User recruiter = userRepository.findById(recruiterId).orElseThrow();
        RecruitmentTask task = new RecruitmentTask();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
        task.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        task.setDueDate(request.getDueDate());
        task.setRecruiter(recruiter);
        
        if (request.getProspectId() != null) {
            RecruitmentProspect prospect = prospectRepository.findById(request.getProspectId()).orElseThrow();
            task.setProspect(prospect);
            logTimeline(prospect, recruiter, "TASK_CREATED", "Scheduled task: " + task.getTitle());
        }
        
        task = taskRepository.save(task);
        return mapToTaskDTO(task);
    }
    
    private RecruitmentTaskDTO mapToTaskDTO(RecruitmentTask t) {
        RecruitmentTaskDTO dto = new RecruitmentTaskDTO();
        dto.setId(t.getId());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setStatus(t.getStatus());
        dto.setPriority(t.getPriority());
        dto.setDueDate(t.getDueDate());
        dto.setRecruiterId(t.getRecruiter().getId());
        if (t.getProspect() != null) {
            dto.setProspectId(t.getProspect().getId());
            dto.setProspectName(t.getProspect().getAthlete().getFirstName() + " " + t.getProspect().getAthlete().getLastName());
        }
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }
    
    // Timeline
    @Transactional(readOnly = true)
    public List<RecruitmentTimelineDTO> getTimeline(Integer prospectId) {
        return timelineRepository.findByProspectIdOrderByCreatedAtDesc(prospectId).stream().map(t -> {
            RecruitmentTimelineDTO dto = new RecruitmentTimelineDTO();
            dto.setId(t.getId());
            dto.setProspectId(t.getProspect().getId());
            dto.setRecruiterName(t.getRecruiter().getFullName());
            dto.setActionType(t.getActionType());
            dto.setDetails(t.getDetails());
            dto.setCreatedAt(t.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }
}

