package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.entity.Organization;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.OrganizationRepository;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.AthleteService;
import com.athletehub.api.service.OrganizationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.athletehub.api.repository.RoleRepository;
import com.athletehub.api.service.CoachService;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final OrganizationRepository organizationRepository;
    private final AthleteRepository athleteRepository;
    private final AthleteService athleteService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CoachService coachService;

    public OrganizationController(OrganizationService organizationService, OrganizationRepository organizationRepository, AthleteRepository athleteRepository, AthleteService athleteService, UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, CoachService coachService) {
        this.organizationService = organizationService;
        this.organizationRepository = organizationRepository;
        this.athleteRepository = athleteRepository;
        this.athleteService = athleteService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.coachService = coachService;
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
    public ResponseEntity<?> createOrganization(@RequestBody Map<String, Object> data) {
        if (!isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        if (data == null || data.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        List<String> errors = organizationService.validateOrganizationData(data);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        Integer userId = getCurrentUserId();
        try {
            Organization org = organizationService.createOrganization(userId, data);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Organization created successfully.", organizationService.getOrganizationDetails(org, 0)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Creation failed.", null, List.of(e.getMessage())));
        }
    }

    @GetMapping
    public ResponseEntity<?> getOrganizations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organization_type_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int page_size,
            @RequestParam(defaultValue = "createdAt") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_dir) {

        if ("created_at".equals(sort_by)) sort_by = "createdAt";
        if ("updated_at".equals(sort_by)) sort_by = "updatedAt";

        Map<String, Object> result = organizationService.listOrganizations(search, organization_type_id, status, city, state, page, page_size, sort_by, sort_dir);

        Map<String, Object> pagination = Map.of(
            "page", result.get("page"),
            "page_size", result.get("page_size"),
            "total_records", result.get("total_records"),
            "total_pages", result.get("total_pages")
        );

        Map<String, Object> finalResponse = Map.of(
            "status", "success",
            "message", "Organizations retrieved successfully.",
            "data", result.get("items"),
            "pagination", pagination
        );

        return ResponseEntity.ok(finalResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrganization(@PathVariable Integer id) {
        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        long athleteCount = athleteRepository.countActiveAthletesByOrganizationId(id);
        return ResponseEntity.ok(ApiResponse.success("Organization retrieved successfully.", organizationService.getOrganizationDetails(optOrg.get(), athleteCount)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrganization(@PathVariable Integer id, @RequestBody Map<String, Object> data) {
        if (!isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        if (data == null || data.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        List<String> errors = organizationService.validateOrganizationData(data);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        Integer userId = getCurrentUserId();
        try {
            Organization updated = organizationService.updateOrganization(optOrg.get(), data, userId);
            long athleteCount = athleteRepository.countActiveAthletesByOrganizationId(id);
            return ResponseEntity.ok(ApiResponse.success("Organization updated successfully.", organizationService.getOrganizationDetails(updated, athleteCount)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Update failed.", null, List.of(e.getMessage())));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrganization(@PathVariable Integer id) {
        if (!isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        Organization org = optOrg.get();
        org.setStatus("Deleted");
        org.setUpdatedBy(getCurrentUserId());
        organizationRepository.save(org);

        return ResponseEntity.ok(ApiResponse.success("Organization deleted successfully.", null));
    }

    @GetMapping("/{id}/athletes")
    public ResponseEntity<?> getOrganizationAthletes(@PathVariable Integer id) {
        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        List<com.athletehub.api.dto.AthleteResponseDTO> athletesData = athleteRepository.findByOrganizationIdAndStatusNot(id, "Deleted")
                .stream()
                .map(athleteService::getAthleteDetails)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Athletes retrieved successfully.", athletesData));
    }

    @GetMapping("/{id}/admin")
    public ResponseEntity<?> getOrganizationAdmin(@PathVariable Integer id) {
        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        List<User> admins = userRepository.findByRoleName("ROLE_ORG_ADMIN").stream()
                .filter(u -> u.getOrganization() != null && u.getOrganization().getId().equals(id))
                .collect(Collectors.toList());

        if (admins.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("No administrator assigned to this organization.", null));
        }

        User admin = admins.get(0);
        Map<String, Object> adminData = new HashMap<>();
        adminData.put("id", admin.getId());
        adminData.put("fullName", admin.getFullName());
        adminData.put("email", admin.getEmail());
        adminData.put("phone", admin.getPhone());
        adminData.put("status", admin.getStatus());

        return ResponseEntity.ok(ApiResponse.success("Administrator retrieved successfully.", adminData));
    }

    @PostMapping("/{id}/admin")
    public ResponseEntity<?> assignOrganizationAdmin(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        if (!isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        Organization org = optOrg.get();

        if (payload.containsKey("userId") && payload.get("userId") != null) {
            Integer userId = ((Number) payload.get("userId")).intValue();
            Optional<User> optUser = userRepository.findById(userId);
            if (optUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found."));
            }

            User user = optUser.get();
            if (!"ROLE_ORG_ADMIN".equals(user.getRole().getName())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Selected user does not have ROLE_ORG_ADMIN role."));
            }

            if (user.getOrganization() != null && !user.getOrganization().getId().equals(id)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Selected administrator is already assigned to organization: " + user.getOrganization().getName()));
            }

            user.setOrganization(org);
            userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("Administrator assigned successfully.", null));
        } else {
            String emailStr = (String) payload.get("email");
            String fullNameStr = (String) payload.get("fullName");
            String passwordStr = (String) payload.get("password");
            String phoneStr = (String) payload.get("phone");

            if (emailStr == null || emailStr.trim().isEmpty() ||
                fullNameStr == null || fullNameStr.trim().isEmpty() ||
                passwordStr == null || passwordStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Missing required fields: email, fullName, password."));
            }

            if (userRepository.existsByEmail(emailStr)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Email is already registered."));
            }

            Optional<com.athletehub.api.entity.Role> roleOpt = roleRepository.findByName("ROLE_ORG_ADMIN");
            if (roleOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("ROLE_ORG_ADMIN role not found."));
            }

            User user = new User();
            user.setFullName(fullNameStr);
            user.setEmail(emailStr);
            user.setPhone(phoneStr);
            user.setPasswordHash(passwordEncoder.encode(passwordStr));
            user.setRole(roleOpt.get());
            user.setOrganization(org);
            userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("Administrator account created and assigned successfully.", null));
        }
    }

    @GetMapping("/unassigned-admins")
    public ResponseEntity<?> getUnassignedAdmins() {
        if (!isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        List<Map<String, Object>> list = userRepository.findUnassignedAdmins().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Unassigned administrators retrieved successfully.", list));
    }

    @GetMapping("/{id}/coaches")
    public ResponseEntity<?> getOrganizationCoaches(@PathVariable Integer id) {
        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        List<com.athletehub.api.dto.CoachDTO> coachesData = coachService.searchCoaches(null, id, null, null, 1, 200, "createdAt", "desc")
                .getCoaches();

        return ResponseEntity.ok(ApiResponse.success("Coaches retrieved successfully.", coachesData));
    }
}
