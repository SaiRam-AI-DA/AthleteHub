package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.CoachDTO;
import com.athletehub.api.dto.CoachMapper;
import com.athletehub.api.dto.CoachRequest;
import com.athletehub.api.dto.CoachResponse;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.User;
import com.athletehub.api.entity.enums.CoachStatus;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.CoachService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/coaches")
public class CoachController {

    private final CoachService coachService;
    private final UserRepository userRepository;
    private final CoachMapper coachMapper;

    public CoachController(CoachService coachService, UserRepository userRepository, CoachMapper coachMapper) {
        this.coachService = coachService;
        this.userRepository = userRepository;
        this.coachMapper = coachMapper;
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
    public ResponseEntity<?> createCoach(@RequestBody CoachRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser != null && "ROLE_ORG_ADMIN".equals(currentUser.getRole().getName())) {
            if (currentUser.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Admin has no organization assigned."));
            }
            request.setOrganizationId(currentUser.getOrganization().getId());
        }

        List<String> errors = coachService.validateCoachRequest(request);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        Integer userId = getCurrentUserId();
        try {
            Coach coach = coachService.createCoach(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Coach profile created successfully.", coachMapper.toDto(coach)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Creation failed.", null, List.of(e.getMessage())));
        }
    }

    @GetMapping
    public ResponseEntity<?> getCoaches(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organization_id,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int page_size,
            @RequestParam(defaultValue = "createdAt") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_dir) {

        if ("created_at".equals(sort_by)) sort_by = "createdAt";
        if ("updated_at".equals(sort_by)) sort_by = "updatedAt";

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        Integer targetOrgId = organization_id;
        if (!isSuperAdmin() && currentUser != null) {
            if ("ROLE_ORG_ADMIN".equals(currentUser.getRole().getName()) || 
                "ROLE_COACH".equals(currentUser.getRole().getName()) ||
                "ROLE_ATHLETE".equals(currentUser.getRole().getName())) {
                if (currentUser.getOrganization() == null) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. User has no organization assigned."));
                }
                targetOrgId = currentUser.getOrganization().getId();
            }
        }

        CoachResponse result = coachService.searchCoaches(search, targetOrgId, specialization, status, page, page_size, sort_by, sort_dir);

        Map<String, Object> pagination = Map.of(
            "page", result.getPage(),
            "page_size", result.getPageSize(),
            "total_records", result.getTotalRecords(),
            "total_pages", result.getTotalPages()
        );

        Map<String, Object> finalResponse = Map.of(
            "status", "success",
            "message", "Coaches retrieved successfully.",
            "data", result.getCoaches(),
            "pagination", pagination
        );

        return ResponseEntity.ok(finalResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCoach(@PathVariable Integer id) {
        Coach coach = coachService.getCoachById(id);
        if (coach == null || coach.getStatus() == CoachStatus.DELETED) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Coach not found."));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        if (!isSuperAdmin() && currentUser != null) {
            if ("ROLE_ORG_ADMIN".equals(currentUser.getRole().getName()) || 
                "ROLE_COACH".equals(currentUser.getRole().getName()) ||
                "ROLE_ATHLETE".equals(currentUser.getRole().getName())) {
                if (currentUser.getOrganization() == null || 
                    !currentUser.getOrganization().getId().equals(coach.getOrganizationId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Coach belongs to a different organization."));
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Coach retrieved successfully.", coachMapper.toDto(coach)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoach(@PathVariable Integer id, @RequestBody CoachRequest request) {
        Coach coach = coachService.getCoachById(id);
        if (coach == null || coach.getStatus() == CoachStatus.DELETED) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Coach not found."));
        }

        if (request == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        if (!isSuperAdmin() && currentUser != null) {
            if ("ROLE_ORG_ADMIN".equals(currentUser.getRole().getName())) {
                if (currentUser.getOrganization() == null || 
                    !currentUser.getOrganization().getId().equals(coach.getOrganizationId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Coach belongs to a different organization."));
                }
                // Force organizationId to match the admin's organization
                request.setOrganizationId(currentUser.getOrganization().getId());
            }
        }

        List<String> errors = coachService.validateCoachRequest(request);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        Integer userId = getCurrentUserId();
        try {
            Coach updated = coachService.updateCoach(id, request, userId);
            return ResponseEntity.ok(ApiResponse.success("Coach updated successfully.", coachMapper.toDto(updated)));
        } catch (Exception e) {
             return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Update failed.", null, List.of(e.getMessage())));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoach(@PathVariable Integer id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized."));
        }

        boolean isSuperAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_ORG_ADMIN"));

        if (!isSuperAdmin() && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        Coach coach = coachService.getCoachById(id);
        if (coach == null || coach.getStatus() == CoachStatus.DELETED) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Coach not found."));
        }

        if (!isSuperAdmin() && "ROLE_ORG_ADMIN".equals(currentUser.getRole().getName())) {
            if (currentUser.getOrganization() == null || 
                !currentUser.getOrganization().getId().equals(coach.getOrganizationId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Coach belongs to a different organization."));
            }
        }

        try {
            Integer userId = getCurrentUserId();
            coachService.softDeleteCoach(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Coach deleted successfully.", null));
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Coach not found."));
        }
    }
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = coachService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved successfully.", stats));
    }
}
