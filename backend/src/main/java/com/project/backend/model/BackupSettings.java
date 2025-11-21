package com.project.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class BackupSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int autoBackupInterval; // Unit: Days
    private int daysBeforeDelete;  // Number of Days before a backup is automatically deleted
    private LocalDateTime lastBackupTime;

    /**
     * Creates a default settings in case there is no settings in the database
     */
    public BackupSettings() {
        id = 1L;
        autoBackupInterval = 7;
        daysBeforeDelete = 30;
        lastBackupTime = LocalDateTime.parse("2024-01-01T00:00:00");
    }



}
