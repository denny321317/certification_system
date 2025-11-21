package com.project.backend.controller;

import com.project.backend.dto.RecentActivityDTO;
import com.project.backend.model.OperationHistory;
import com.project.backend.service.OperationHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "http://localhost:3000")
public class OperationHistoryController {

    private final OperationHistoryService operationHistoryService;

    @Autowired
    public OperationHistoryController(OperationHistoryService operationHistoryService) {
        this.operationHistoryService = operationHistoryService;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<OperationHistory>> getHistoryByProjectId(@PathVariable Long projectId) {
        List<OperationHistory> history = operationHistoryService.getHistoryForProject(projectId);
        return ResponseEntity.ok(history);
    }



} 