package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.EventMapper;
import com.athletehub.api.dto.EventRequest;
import com.athletehub.api.dto.EventResponse;
import com.athletehub.api.entity.Event;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.EventService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;

    public EventController(EventService eventService, UserRepository userRepository) {
        this.eventService = eventService;
        this.userRepository = userRepository;
    }

    private Integer getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }

    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(@RequestBody EventRequest request) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() == null) {
                    throw new Exception("Organization Administrator is not linked to any organization.");
                }
                request.setOrganizationId(currentUser.getOrganization().getId());
            }

            Event event = eventService.createEvent(request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Event created successfully", EventMapper.toResponse(event)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(@PathVariable Integer id, @RequestBody EventRequest request) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() == null) {
                    throw new Exception("Organization Administrator is not linked to any organization.");
                }
                request.setOrganizationId(currentUser.getOrganization().getId());
            }

            Event event = eventService.updateEvent(id, request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Event updated successfully", EventMapper.toResponse(event)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(@PathVariable Integer id) {
        try {
            Event event = eventService.getEventById(id);
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH")) {
                if (currentUser.getOrganization() != null && !event.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Event belongs to a different organization.");
                }
            }
            return ResponseEntity.ok(ApiResponse.success("Event details fetched successfully", EventMapper.toResponse(event)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH")) {
                if (currentUser.getOrganization() != null) {
                    organizationId = currentUser.getOrganization().getId();
                } else {
                    organizationId = -1; // Force empty result if not linked
                }
            }

            Page<Event> eventPage = eventService.searchEvents(search, organizationId, status, page, pageSize, sortBy, sortDir);
            
            Map<String, Object> result = new HashMap<>();
            result.put("items", eventPage.getContent().stream().map(EventMapper::toResponse).collect(Collectors.toList()));
            result.put("total_records", eventPage.getTotalElements());
            result.put("total_pages", eventPage.getTotalPages());
            result.put("page", page);
            result.put("page_size", pageSize);
            
            return ResponseEntity.ok(ApiResponse.success("Events fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Event event = eventService.getEventById(id);
            
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() != null && !event.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Event belongs to a different organization.");
                }
            }

            eventService.deleteEvent(id, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Event deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }
}
