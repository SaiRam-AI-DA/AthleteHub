package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.CoachAssignmentMapper;
import com.athletehub.api.dto.CoachAssignmentRequest;
import com.athletehub.api.dto.CoachAssignmentResponse;
import com.athletehub.api.entity.CoachAssignment;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.CoachAssignmentService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/coach-assignments")
public class CoachAssignmentController {

    private final CoachAssignmentService assignmentService;
    private final UserRepository userRepository;
    private final CoachAssignmentMapper mapper;

    public CoachAssignmentController(CoachAssignmentService assignmentService, UserRepository userRepository, CoachAssignmentMapper mapper) {
        this.assignmentService = assignmentService;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    private Integer getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.map(User::getId).orElse(null);
    }

    private boolean isSuperAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
    }

    @PostMapping
    public ResponseEntity<?> createAssignment(@RequestBody CoachAssignmentRequest request) {
        List<String> errors = assignmentService.validateAssignmentRequest(request);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        try {
            CoachAssignment assignment = assignmentService.createAssignment(getCurrentUserId(), request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Assignment created successfully.", mapper.toDto(assignment)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Creation failed.", null, List.of(e.getMessage())));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAssignments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organization_id,
            @RequestParam(required = false) Integer coach_id,
            @RequestParam(required = false) Integer athlete_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int page_size,
            @RequestParam(defaultValue = "createdAt") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_dir) {

        if ("created_at".equals(sort_by)) sort_by = "createdAt";
        if ("updated_at".equals(sort_by)) sort_by = "updatedAt";

        CoachAssignmentResponse result = assignmentService.searchAssignments(
                search, organization_id, coach_id, athlete_id, status, start_date, end_date, page, page_size, sort_by, sort_dir);

        Map<String, Object> pagination = Map.of(
            "page", result.getPage(),
            "page_size", result.getPageSize(),
            "total_records", result.getTotalRecords(),
            "total_pages", result.getTotalPages()
        );

        Map<String, Object> finalResponse = Map.of(
            "status", "success",
            "message", "Assignments retrieved successfully.",
            "data", result.getAssignments(),
            "pagination", pagination
        );

        return ResponseEntity.ok(finalResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAssignment(@PathVariable Integer id) {
        CoachAssignment assignment = assignmentService.getAssignmentById(id);
        if (assignment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Assignment not found."));
        }
        return ResponseEntity.ok(ApiResponse.success("Assignment retrieved successfully.", mapper.toDto(assignment)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAssignment(@PathVariable Integer id, @RequestBody CoachAssignmentRequest request) {
        try {
            CoachAssignment updated = assignmentService.updateAssignment(id, request, getCurrentUserId(), isSuperAdmin());
            return ResponseEntity.ok(ApiResponse.success("Assignment updated successfully.", mapper.toDto(updated)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Update failed.", null, List.of(e.getMessage())));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelAssignment(@PathVariable Integer id) {
        if (!isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        try {
            assignmentService.deleteAssignment(id, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Assignment cancelled successfully.", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Assignment not found."));
        }
    }

    @GetMapping("/by-coach/{coachId}")
    public ResponseEntity<?> getByCoach(@PathVariable Integer coachId) {
        List<CoachAssignment> assignments = assignmentService.getAssignmentsByCoach(coachId);
        return ResponseEntity.ok(ApiResponse.success("Success", assignments.stream().map(mapper::toDto).collect(Collectors.toList())));
    }

    @GetMapping("/by-athlete/{athleteId}")
    public ResponseEntity<?> getByAthlete(@PathVariable Integer athleteId) {
        List<CoachAssignment> assignments = assignmentService.getAssignmentsByAthlete(athleteId);
        return ResponseEntity.ok(ApiResponse.success("Success", assignments.stream().map(mapper::toDto).collect(Collectors.toList())));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", assignmentService.getDashboardStats()));
    }
}
