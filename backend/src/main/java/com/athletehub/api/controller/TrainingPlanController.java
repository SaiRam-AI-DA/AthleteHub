package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.TrainingPlanDTO;
import com.athletehub.api.dto.TrainingPlanRequest;
import com.athletehub.api.service.TrainingPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/training-plans")
public class TrainingPlanController {

    @Autowired
    private TrainingPlanService trainingPlanService;

    @PostMapping
    public ResponseEntity<ApiResponse<TrainingPlanDTO>> createTrainingPlan(@RequestBody TrainingPlanRequest request) {
        TrainingPlanDTO created = trainingPlanService.createTrainingPlan(request);
        return ResponseEntity.ok(ApiResponse.success("Training Plan created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TrainingPlanDTO>> updateTrainingPlan(@PathVariable Integer id, @RequestBody TrainingPlanRequest request) {
        TrainingPlanDTO updated = trainingPlanService.updateTrainingPlan(id, request);
        return ResponseEntity.ok(ApiResponse.success("Training Plan updated successfully", updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrainingPlanDTO>> getTrainingPlanById(@PathVariable Integer id) {
        TrainingPlanDTO plan = trainingPlanService.getTrainingPlanById(id);
        return ResponseEntity.ok(ApiResponse.success("Training Plan retrieved successfully", plan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTrainingPlan(@PathVariable Integer id) {
        trainingPlanService.deleteTrainingPlan(id);
        return ResponseEntity.ok(ApiResponse.success("Training Plan archived successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchTrainingPlans(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false) Integer coachId,
            @RequestParam(required = false) Integer sportId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String difficultyLevel,
            Pageable pageable) {
        Page<TrainingPlanDTO> plans = trainingPlanService.searchTrainingPlans(search, organizationId, coachId, sportId, status, difficultyLevel, pageable);
        
        Map<String, Object> result = new HashMap<>();
        result.put("items", plans.getContent());
        result.put("total_records", plans.getTotalElements());
        result.put("total_pages", plans.getTotalPages());
        result.put("page", pageable.getPageNumber() + 1);
        result.put("page_size", pageable.getPageSize());
        
        return ResponseEntity.ok(ApiResponse.success("Training Plans retrieved successfully", result));
    }
}
