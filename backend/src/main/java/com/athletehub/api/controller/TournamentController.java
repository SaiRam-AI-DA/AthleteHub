package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.TournamentMapper;
import com.athletehub.api.dto.TournamentRequest;
import com.athletehub.api.dto.TournamentResponse;
import com.athletehub.api.dto.AthleteRegistrationMapper;
import com.athletehub.api.dto.AthleteRegistrationRequest;
import com.athletehub.api.dto.AthleteRegistrationResponse;
import com.athletehub.api.entity.Tournament;
import com.athletehub.api.entity.AthleteRegistration;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.TournamentService;
import com.athletehub.api.service.AthleteRegistrationService;
import com.athletehub.api.service.BracketGenerationService;
import com.athletehub.api.entity.Match;
import com.athletehub.api.dto.MatchResponse;
import com.athletehub.api.dto.MatchMapper;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tournaments")
public class TournamentController {

    private final TournamentService tournamentService;
    private final AthleteRegistrationService registrationService;
    private final BracketGenerationService bracketGenerationService;
    private final UserRepository userRepository;

    public TournamentController(TournamentService tournamentService, 
                                AthleteRegistrationService registrationService, 
                                BracketGenerationService bracketGenerationService,
                                UserRepository userRepository) {
        this.tournamentService = tournamentService;
        this.registrationService = registrationService;
        this.bracketGenerationService = bracketGenerationService;
        this.userRepository = userRepository;
    }

    private Integer getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }

    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TournamentResponse>> createTournament(@RequestBody TournamentRequest request) {
        try {
            Tournament tournament = tournamentService.createTournament(request, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Tournament created successfully", TournamentMapper.toResponse(tournament)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TournamentResponse>> updateTournament(@PathVariable Integer id, @RequestBody TournamentRequest request) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Tournament existing = tournamentService.getTournamentById(id);
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() == null || !existing.getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Tournament belongs to a different organization.");
                }
            }

            Tournament tournament = tournamentService.updateTournament(id, request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Tournament updated successfully", TournamentMapper.toResponse(tournament)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TournamentResponse>> getTournament(@PathVariable Integer id) {
        try {
            Tournament tournament = tournamentService.getTournamentById(id);
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH")) {
                if (currentUser.getOrganization() != null && !tournament.getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Tournament belongs to a different organization.");
                }
            }
            return ResponseEntity.ok(ApiResponse.success("Tournament details fetched successfully", TournamentMapper.toResponse(tournament)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTournaments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) Integer sportId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        try {
            Integer organizationId = null;
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH")) {
                if (currentUser.getOrganization() != null) {
                    organizationId = currentUser.getOrganization().getId();
                } else {
                    organizationId = -1;
                }
            }

            Page<Tournament> tournamentPage = tournamentService.searchTournaments(search, eventId, sportId, status, organizationId, page, pageSize, sortBy, sortDir);
            
            Map<String, Object> result = new HashMap<>();
            result.put("items", tournamentPage.getContent().stream().map(TournamentMapper::toResponse).collect(Collectors.toList()));
            result.put("total_records", tournamentPage.getTotalElements());
            result.put("total_pages", tournamentPage.getTotalPages());
            result.put("page", page);
            result.put("page_size", pageSize);
            
            return ResponseEntity.ok(ApiResponse.success("Tournaments fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PostMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('ATHLETE', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AthleteRegistrationResponse>> registerAthlete(@PathVariable Integer id, @RequestBody AthleteRegistrationRequest request) {
        try {
            request.setTournamentId(id);
            AthleteRegistration registration = registrationService.registerAthlete(request, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Athlete registered successfully", AthleteRegistrationMapper.toResponse(registration)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRegistrations(
            @PathVariable Integer id,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer athleteId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        try {
            Integer organizationId = null;
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH")) {
                if (currentUser.getOrganization() != null) {
                    organizationId = currentUser.getOrganization().getId();
                } else {
                    organizationId = -1;
                }
            }

            Page<AthleteRegistration> registrationPage = registrationService.searchRegistrations(search, id, athleteId, status, organizationId, page, pageSize, sortBy, sortDir);
            
            Map<String, Object> result = new HashMap<>();
            result.put("items", registrationPage.getContent().stream().map(AthleteRegistrationMapper::toResponse).collect(Collectors.toList()));
            result.put("total_records", registrationPage.getTotalElements());
            result.put("total_pages", registrationPage.getTotalPages());
            result.put("page", page);
            result.put("page_size", pageSize);
            
            return ResponseEntity.ok(ApiResponse.success("Registrations fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }
    
    @PutMapping("/registrations/{registrationId}/status")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AthleteRegistrationResponse>> updateRegistrationStatus(
            @PathVariable Integer registrationId,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        try {
            AthleteRegistration registration = registrationService.updateRegistrationStatus(registrationId, status, remarks, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Registration status updated successfully", AthleteRegistrationMapper.toResponse(registration)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @DeleteMapping("/registrations/{registrationId}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRegistration(@PathVariable Integer registrationId) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            AthleteRegistration registration = registrationService.getRegistrationById(registrationId);
            
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() != null && !registration.getTournament().getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Registration belongs to a different organization.");
                }
            }

            registrationService.deleteRegistration(registrationId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Registration deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTournament(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Tournament tournament = tournamentService.getTournamentById(id);
            
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() != null && !tournament.getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Tournament belongs to a different organization.");
                }
            }

            tournamentService.deleteTournament(id, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Tournament deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PostMapping("/{id}/generate-bracket")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> generateBracket(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Tournament tournament = tournamentService.getTournamentById(id);
            
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() != null && !tournament.getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Tournament belongs to a different organization.");
                }
            }

            List<Match> matches = bracketGenerationService.generateBracket(id, currentUser.getId());
            List<MatchResponse> response = matches.stream().map(MatchMapper::toResponse).collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Bracket generated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}/bracket")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getBracket(@PathVariable Integer id) {
        try {
            List<Match> matches = bracketGenerationService.getBracket(id);
            List<MatchResponse> response = matches.stream().map(MatchMapper::toResponse).collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Bracket retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }
}
