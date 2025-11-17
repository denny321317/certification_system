package com.project.backend.controller;

import com.project.backend.dto.BackupSettingsDTO;
import com.project.backend.model.BackupSettings;
import com.project.backend.service.BackupSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/backup")
@CrossOrigin(origins = "http://localhost:3000")
public class BackupSettingsController {

    @Autowired
    private BackupSettingsService backupSettingsService;

    @GetMapping
    public ResponseEntity<BackupSettings> getBackupSettings() {
        BackupSettings settings = backupSettingsService.getBackupSettings();
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<BackupSettings> updateBackupSettings(@RequestBody BackupSettingsDTO backupSettingsDTO) {
        BackupSettings updatedSettings = backupSettingsService.updateBackupSettings(backupSettingsDTO);
        return ResponseEntity.ok(updatedSettings);
    }
}