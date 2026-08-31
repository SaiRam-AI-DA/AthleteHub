package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.AthleteRequestDTO;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.AthleteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/athletes")
public class AthleteController {

    private final AthleteService athleteService;
    private final AthleteRepository athleteRepository;
    private final UserRepository userRepository;

    public AthleteController(AthleteService athleteService, AthleteRepository athleteRepository, UserRepository userRepository) {
        this.athleteService = athleteService;
        this.athleteRepository = athleteRepository;
        this.userRepository = userRepository;
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
    public ResponseEntity<?> createAthlete(@RequestBody AthleteRequestDTO data) {
        if (data == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser != null && "ROLE_ORG_ADMIN".equals(currentUser.getRole().getName())) {
            if (currentUser.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Admin has no organization assigned."));
            }
            data.setOrganizationId(currentUser.getOrganization().getId());
        }

        List<String> errors = athleteService.validateAthleteData(data);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        Integer userId = getCurrentUserId();
        try {
            Athlete athlete = athleteService.createAthlete(userId, data);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Athlete profile created successfully.", athleteService.getAthleteDetails(athlete)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Creation failed.", null, List.of(e.getMessage())));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAthletes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer sport_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) Double minHeight,
            @RequestParam(required = false) Double maxHeight,
            @RequestParam(required = false) Double minWeight,
            @RequestParam(required = false) Double maxWeight,
            @RequestParam(required = false) String medicalStatus,
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int page_size,
            @RequestParam(defaultValue = "createdAt") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_dir) {

        if ("created_at".equals(sort_by)) sort_by = "createdAt";
        if ("updated_at".equals(sort_by)) sort_by = "updatedAt";

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        Integer targetOrgId = organizationId;
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

        Map<String, Object> result = athleteService.listAthletes(
            search, sport_id, status, gender, minAge, maxAge, 
            minHeight, maxHeight, minWeight, maxWeight, medicalStatus, targetOrgId,
            page, page_size, sort_by, sort_dir
        );

        Map<String, Object> pagination = Map.of(
            "page", result.get("page"),
            "page_size", result.get("page_size"),
            "total_records", result.get("total_records"),
            "total_pages", result.get("total_pages")
        );

        Map<String, Object> finalResponse = Map.of(
            "status", "success",
            "message", "Athletes retrieved successfully.",
            "data", result.get("items"),
            "pagination", pagination
        );

        return ResponseEntity.ok(finalResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAthlete(@PathVariable Integer id) {
        Optional<Athlete> optAthlete = athleteRepository.findById(id);
        if (optAthlete.isEmpty() || "Deleted".equals(optAthlete.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Athlete not found."));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        Athlete athlete = optAthlete.get();
        if (!isSuperAdmin() && currentUser != null) {
            if ("ROLE_ORG_ADMIN".equals(currentUser.getRole().getName()) || 
                "ROLE_COACH".equals(currentUser.getRole().getName()) ||
                "ROLE_ATHLETE".equals(currentUser.getRole().getName())) {
                if (currentUser.getOrganization() == null || 
                    !currentUser.getOrganization().getId().equals(athlete.getOrganizationId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Athlete belongs to a different organization."));
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Athlete retrieved successfully.", athleteService.getAthleteDetails(optAthlete.get())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAthlete(@PathVariable Integer id, @RequestBody AthleteRequestDTO data) {
        Optional<Athlete> optAthlete = athleteRepository.findById(id);
        if (optAthlete.isEmpty() || "Deleted".equals(optAthlete.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Athlete not found."));
        }

        if (data == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        Athlete athlete = optAthlete.get();
        if (!isSuperAdmin() && currentUser != null) {
            if ("ROLE_ORG_ADMIN".equals(currentUser.getRole().getName())) {
                if (currentUser.getOrganization() == null || 
                    !currentUser.getOrganization().getId().equals(athlete.getOrganizationId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Athlete belongs to a different organization."));
                }
                // Force organizationId to match the admin's organization
                data.setOrganizationId(currentUser.getOrganization().getId());
            }
        }

        List<String> errors = athleteService.validateAthleteData(data);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        Integer userId = getCurrentUserId();
        Athlete updated = athleteService.updateAthlete(optAthlete.get(), data, userId);

        return ResponseEntity.ok(ApiResponse.success("Athlete updated successfully.", athleteService.getAthleteDetails(updated)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAthlete(@PathVariable Integer id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized."));
        }

        Optional<Athlete> optAthlete = athleteRepository.findById(id);
        if (optAthlete.isEmpty() || "Deleted".equals(optAthlete.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Athlete not found."));
        }

        Athlete athlete = optAthlete.get();

        boolean isSuperAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_ORG_ADMIN"));
        
        if (!isSuperAdmin) {
            if (!isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
            }
            if (currentUser.getOrganization() == null || athlete.getOrganizationId() == null || 
                !currentUser.getOrganization().getId().equals(athlete.getOrganizationId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Athlete belongs to a different organization."));
            }
        }

        athlete.setStatus("Deleted");
        athleteRepository.save(athlete);

        return ResponseEntity.ok(ApiResponse.success("Athlete deleted successfully.", null));
    }
}
