package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.recruitment.*;
import com.athletehub.api.entity.enums.RecruitmentStage;
import com.athletehub.api.service.RecruitmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruitment")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RECRUITER')")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;
    private final UserRepository userRepository;

    public RecruitmentController(RecruitmentService recruitmentService, UserRepository userRepository) {
        this.recruitmentService = recruitmentService;
        this.userRepository = userRepository;
    }

    private Integer getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<RecruitmentDashboardDTO>> getDashboard(Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved successfully", recruitmentService.getDashboardMetrics(recruiterId)));
    }

    @GetMapping("/prospects")
    public ResponseEntity<ApiResponse<List<RecruitmentProspectDTO>>> getProspects(Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Prospects retrieved successfully", recruitmentService.getProspects(recruiterId)));
    }

    @GetMapping("/discover")
    public ResponseEntity<ApiResponse<List<com.athletehub.api.dto.AthleteResponseDTO>>> discoverAthletes(
            @RequestParam(required = false) Integer sportId,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) Integer minRating) {
        return ResponseEntity.ok(ApiResponse.success("Athletes discovered successfully", 
                recruitmentService.discoverAthletes(sportId, minAge, maxAge, minRating)));
    }

    @PostMapping("/prospects")
    public ResponseEntity<ApiResponse<RecruitmentProspectDTO>> addProspect(
            @RequestParam Integer athleteId,
            @RequestParam Integer organizationId,
            Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Prospect added successfully", recruitmentService.addProspect(athleteId, recruiterId, organizationId)));
    }

    @PutMapping("/prospects/{id}/stage")
    public ResponseEntity<ApiResponse<RecruitmentProspectDTO>> updateStage(
            @PathVariable Integer id,
            @RequestParam RecruitmentStage stage,
            Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Stage updated successfully", recruitmentService.updateProspectStage(id, stage, recruiterId)));
    }

    @GetMapping("/prospects/{id}/notes")
    public ResponseEntity<ApiResponse<List<RecruitmentNoteDTO>>> getNotes(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Notes retrieved successfully", recruitmentService.getNotes(id)));
    }

    @PostMapping("/prospects/{id}/notes")
    public ResponseEntity<ApiResponse<RecruitmentNoteDTO>> addNote(
            @PathVariable Integer id,
            @RequestBody RecruitmentNoteDTO request,
            Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Note added successfully", recruitmentService.addNote(id, recruiterId, request.getNoteText(), request.getRating())));
    }

    @GetMapping("/prospects/{id}/timeline")
    public ResponseEntity<ApiResponse<List<RecruitmentTimelineDTO>>> getTimeline(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Timeline retrieved successfully", recruitmentService.getTimeline(id)));
    }

    @GetMapping("/shortlists")
    public ResponseEntity<ApiResponse<List<RecruitmentShortlistDTO>>> getShortlists(Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Shortlists retrieved successfully", recruitmentService.getShortlists(recruiterId)));
    }

    @PostMapping("/shortlists/{id}/athletes")
    public ResponseEntity<ApiResponse<Void>> addAthleteToShortlist(
            @PathVariable Integer id,
            @RequestParam Integer athleteId) {
        recruitmentService.addAthleteToShortlist(id, athleteId);
        return ResponseEntity.ok(ApiResponse.success("Athlete added to shortlist successfully", null));
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<RecruitmentTaskDTO>>> getTasks(Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", recruitmentService.getTasks(recruiterId)));
    }

    @PostMapping("/tasks")
    public ResponseEntity<ApiResponse<RecruitmentTaskDTO>> addTask(
            @RequestBody RecruitmentTaskDTO request,
            Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Task added successfully", recruitmentService.addTask(request, recruiterId)));
    }
}


