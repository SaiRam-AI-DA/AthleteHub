package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.TrainingDashboardStatsDTO;
import com.athletehub.api.service.TrainingDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/training-dashboard")
public class TrainingDashboardController {

    @Autowired
    private TrainingDashboardService trainingDashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<TrainingDashboardStatsDTO>> getDashboardStats(
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false) Integer coachId,
            @RequestParam(required = false) Integer athleteId) {
        TrainingDashboardStatsDTO stats = trainingDashboardService.getDashboardStats(organizationId, coachId, athleteId);
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved successfully", stats));
    }
}
