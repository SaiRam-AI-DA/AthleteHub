package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.TrainingAttendanceDTO;
import com.athletehub.api.dto.TrainingAttendanceRequest;
import com.athletehub.api.service.TrainingAttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/training-attendance")
public class TrainingAttendanceController {

    @Autowired
    private TrainingAttendanceService trainingAttendanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<TrainingAttendanceDTO>> recordAttendance(@RequestBody TrainingAttendanceRequest request) {
        TrainingAttendanceDTO recorded = trainingAttendanceService.recordAttendance(request);
        return ResponseEntity.ok(ApiResponse.success("Attendance recorded successfully", recorded));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TrainingAttendanceDTO>> updateAttendance(@PathVariable Integer id, @RequestBody TrainingAttendanceRequest request) {
        TrainingAttendanceDTO updated = trainingAttendanceService.updateAttendance(id, request);
        return ResponseEntity.ok(ApiResponse.success("Attendance updated successfully", updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrainingAttendanceDTO>> getAttendanceById(@PathVariable Integer id) {
        TrainingAttendanceDTO attendance = trainingAttendanceService.getAttendanceById(id);
        return ResponseEntity.ok(ApiResponse.success("Attendance retrieved successfully", attendance));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<Page<TrainingAttendanceDTO>>> getAttendanceBySessionId(@PathVariable Integer sessionId, Pageable pageable) {
        Page<TrainingAttendanceDTO> attendance = trainingAttendanceService.getAttendanceBySessionId(sessionId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Attendance retrieved successfully", attendance));
    }

    @GetMapping("/athlete/{athleteId}")
    public ResponseEntity<ApiResponse<Page<TrainingAttendanceDTO>>> getAttendanceByAthleteId(@PathVariable Integer athleteId, Pageable pageable) {
        Page<TrainingAttendanceDTO> attendance = trainingAttendanceService.getAttendanceByAthleteId(athleteId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Attendance retrieved successfully", attendance));
    }
}
