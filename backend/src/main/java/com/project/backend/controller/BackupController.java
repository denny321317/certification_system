package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.service.BackupService;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/backup")
public class BackupController {
    
    @Autowired
    private BackupService backupService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createBackup() {
        try {
            String backupPath = backupService.createBackup();
            String message = "Database backup created successfully at: " + backupPath;
            Map<String, String> response = Collections.singletonMap("message", message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Log the full exception for debugging
            Map<String, String> response = Collections.singletonMap("error", "Failed to create backup: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
