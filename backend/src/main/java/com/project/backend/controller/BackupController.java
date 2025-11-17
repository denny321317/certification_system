package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.project.backend.service.BackupService;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/backup")
public class BackupController {
    
    @Autowired
    private BackupService backupService;

    /**
     * Dump the Database into a .sql file that can be used to restore the database.
     * To use this API, you need to have "mysqldump" installed in your system 
     * and include it in system PATH. The backup file will be putted into a directory named "backups".
     * @return
     */
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

    @PostMapping("/restore")
    public ResponseEntity<Map<String, String>> restoreBackup(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Please select a file to upload."));
        }

        try {
            String newDbName = backupService.restoreBackup(file);
            String message = "Database restored successfully into new schema: " + newDbName;
            Map<String, String> response = Collections.singletonMap("message", message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = Collections.singletonMap("error", "Failed to restore backup: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
