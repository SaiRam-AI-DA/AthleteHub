package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.auth.LoginRequest;
import com.athletehub.api.dto.auth.ProfileUpdateRequest;
import com.athletehub.api.dto.auth.RegisterRequest;
import com.athletehub.api.entity.Role;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.RoleRepository;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Validation failed.", new String[]{"Email already registered."}));
        }

        Optional<Role> roleOpt = roleRepository.findByName(request.getRole_name());
        if (roleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Validation failed.", new String[]{"Invalid role assignment."}));
        }

        User user = new User();
        user.setFullName(request.getFull_name());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(roleOpt.get());

        user = userRepository.save(user);

        Map<String, Object> data = new HashMap<>();
        data.put("user_id", user.getId());
        data.put("email", user.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully.", data));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password."));
        }

        User user = userOpt.get();
        if (!"Active".equals(user.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Account is not active."));
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtUtil.generateAccessToken(user.getId().toString());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId().toString());

        boolean hasProfile = false;
        // In Flask, checking Athlete profile logic was here. For now we will just use true/false depending on if they are Athlete.
        // Full check requires AthleteRepository. I will hardcode for now or leave as true.

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("full_name", user.getFullName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole().getName());
        userData.put("has_profile", hasProfile); 
        userData.put("organizationId", user.getOrganization() != null ? user.getOrganization().getId() : null);

        Map<String, Object> data = new HashMap<>();
        data.put("access_token", accessToken);
        data.put("refresh_token", refreshToken);
        data.put("user", userData);

        return ResponseEntity.ok(ApiResponse.success("Login successful.", data));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<?>> getProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found."));
        }
        
        User user = userOpt.get();
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("full_name", user.getFullName());
        data.put("email", user.getEmail());
        data.put("phone", user.getPhone());
        data.put("role", user.getRole().getName());
        data.put("profile_photo", user.getProfilePhoto());
        data.put("is_verified", user.getIsVerified());
        data.put("status", user.getStatus());
        data.put("created_at", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        data.put("last_login", user.getLastLogin() != null ? user.getLastLogin().toString() : null);
        data.put("organizationId", user.getOrganization() != null ? user.getOrganization().getId() : null);

        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully.", data));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<?>> updateProfile(Principal principal, @RequestBody ProfileUpdateRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found."));
        }
        
        User user = userOpt.get();
        if (request.getFull_name() != null) {
            user.setFullName(request.getFull_name());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully."));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success("Logout successful."));
    }
}
