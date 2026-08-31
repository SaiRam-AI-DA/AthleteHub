package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.TrainingSessionDTO;
import com.athletehub.api.dto.TrainingSessionRequest;
import com.athletehub.api.service.TrainingSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/training-sessions")
public class TrainingSessionController {

    @Autowired
    private TrainingSessionService trainingSessionService;

    @PostMapping
    public ResponseEntity<ApiResponse<TrainingSessionDTO>> createTrainingSession(@RequestBody TrainingSessionRequest request) {
        TrainingSessionDTO created = trainingSessionService.createTrainingSession(request);
        return ResponseEntity.ok(ApiResponse.success("Training Session created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TrainingSessionDTO>> updateTrainingSession(@PathVariable Integer id, @RequestBody TrainingSessionRequest request) {
        TrainingSessionDTO updated = trainingSessionService.updateTrainingSession(id, request);
        return ResponseEntity.ok(ApiResponse.success("Training Session updated successfully", updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrainingSessionDTO>> getTrainingSessionById(@PathVariable Integer id) {
        TrainingSessionDTO session = trainingSessionService.getTrainingSessionById(id);
        return ResponseEntity.ok(ApiResponse.success("Training Session retrieved successfully", session));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTrainingSession(@PathVariable Integer id) {
        trainingSessionService.deleteTrainingSession(id);
        return ResponseEntity.ok(ApiResponse.success("Training Session cancelled successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchTrainingSessions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false) Integer coachId,
            @RequestParam(required = false) Integer athleteId,
            @RequestParam(required = false) Integer trainingPlanId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String intensity,
            Pageable pageable) {
        Page<TrainingSessionDTO> sessions = trainingSessionService.searchTrainingSessions(search, organizationId, coachId, athleteId, trainingPlanId, startDate, endDate, status, intensity, pageable);
        
        Map<String, Object> result = new HashMap<>();
        result.put("items", sessions.getContent());
        result.put("total_records", sessions.getTotalElements());
        result.put("total_pages", sessions.getTotalPages());
        result.put("page", pageable.getPageNumber() + 1);
        result.put("page_size", pageable.getPageSize());

        return ResponseEntity.ok(ApiResponse.success("Training Sessions retrieved successfully", result));
    }
}
