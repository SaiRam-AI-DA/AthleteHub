package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.MatchMapper;
import com.athletehub.api.dto.MatchRequest;
import com.athletehub.api.dto.MatchResponse;
import com.athletehub.api.dto.MatchResultMapper;
import com.athletehub.api.dto.MatchResultRequest;
import com.athletehub.api.dto.MatchResultResponse;
import com.athletehub.api.entity.Match;
import com.athletehub.api.entity.MatchResult;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.MatchService;
import com.athletehub.api.service.MatchResultService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/matches")
public class MatchController {

    private final MatchService matchService;
    private final MatchResultService matchResultService;
    private final UserRepository userRepository;

    public MatchController(MatchService matchService, MatchResultService matchResultService, UserRepository userRepository) {
        this.matchService = matchService;
        this.matchResultService = matchResultService;
        this.userRepository = userRepository;
    }

    private Integer getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }

    private boolean isSuperAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<MatchResponse>> createMatch(@RequestBody MatchRequest request) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() == null) {
                    throw new Exception("Access Denied: Admin has no linked organization.");
                }
            }

            Match match = matchService.createMatch(request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Match created successfully", MatchMapper.toResponse(match)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<MatchResponse>> updateMatch(@PathVariable Integer id, @RequestBody MatchRequest request) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Match existing = matchService.getMatchById(id);
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() == null || !existing.getTournament().getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Match belongs to a different organization.");
                }
            }

            Match match = matchService.updateMatch(id, request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Match updated successfully", MatchMapper.toResponse(match)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<MatchResponse>> getMatch(@PathVariable Integer id) {
        try {
            Match match = matchService.getMatchById(id);
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH")) {
                if (currentUser.getOrganization() != null && !match.getTournament().getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Match belongs to a different organization.");
                }
            }
            return ResponseEntity.ok(ApiResponse.success("Match details fetched successfully", MatchMapper.toResponse(match)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMatches(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer tournamentId,
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

            Page<Match> matchPage = matchService.searchMatches(search, tournamentId, status, organizationId, page, pageSize, sortBy, sortDir);
            
            Map<String, Object> result = new HashMap<>();
            result.put("items", matchPage.getContent().stream().map(MatchMapper::toResponse).collect(Collectors.toList()));
            result.put("total_records", matchPage.getTotalElements());
            result.put("total_pages", matchPage.getTotalPages());
            result.put("page", page);
            result.put("page_size", pageSize);
            
            return ResponseEntity.ok(ApiResponse.success("Matches fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PostMapping("/{id}/results")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<MatchResultResponse>> addMatchResult(@PathVariable Integer id, @RequestBody MatchResultRequest request) {
        try {
            request.setMatchId(id);
            MatchResult result = matchResultService.addResult(request, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Match result added successfully", MatchResultMapper.toResponse(result)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PutMapping("/results/{resultId}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<MatchResultResponse>> updateMatchResult(@PathVariable Integer resultId, @RequestBody MatchResultRequest request) {
        try {
            MatchResult result = matchResultService.updateResult(resultId, request, getCurrentUserId(), isSuperAdmin());
            return ResponseEntity.ok(ApiResponse.success("Match result updated successfully", MatchResultMapper.toResponse(result)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}/results")
    @PreAuthorize("hasAnyRole('USER', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<MatchResultResponse>>> getMatchResults(@PathVariable Integer id) {
        try {
            List<MatchResult> results = matchResultService.getResultsByMatch(id);
            return ResponseEntity.ok(ApiResponse.success("Match results fetched successfully", results.stream().map(MatchResultMapper::toResponse).collect(Collectors.toList())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/results/athlete/{athleteId}")
    @PreAuthorize("hasAnyRole('USER', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<MatchResultResponse>>> getMatchResultsByAthlete(@PathVariable Integer athleteId) {
        try {
            List<MatchResult> results = matchResultService.getResultsByAthlete(athleteId);
            return ResponseEntity.ok(ApiResponse.success("Athlete match results fetched successfully", results.stream().map(MatchResultMapper::toResponse).collect(Collectors.toList())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @DeleteMapping("/results/{resultId}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMatchResult(@PathVariable Integer resultId) {
        try {
            matchResultService.deleteResult(resultId, getCurrentUserId(), isSuperAdmin());
            return ResponseEntity.ok(ApiResponse.success("Match result deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMatch(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Match match = matchService.getMatchById(id);
            
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() != null && !match.getTournament().getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Match belongs to a different organization.");
                }
            }

            matchService.deleteMatch(id, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Match deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }
}
