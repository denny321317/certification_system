package com.project.backend.service;

import com.project.backend.dto.BackupSettingsDTO;
import com.project.backend.model.BackupSettings;
import com.project.backend.repository.BackupSettingsRepository;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BackupSettingsService {

    @Autowired
    private BackupSettingsRepository backupSettingsRepository;

    /**
     * Retrieves the current backup settings. If no settings exist,
     * it creates and saves a default entry.
     * @return The current BackupSettings.
     */
    @Transactional
    public BackupSettings getBackupSettings() {
        // There should only ever be one settings entry, with ID 1.
        return backupSettingsRepository.findById(1L).orElseGet(() -> {
            BackupSettings defaultSettings = new BackupSettings();
            return backupSettingsRepository.save(defaultSettings);
        });
    }

    /**
     * Updates the backup settings based on the provided DTO.
     * @param backupSettingsDTO The DTO containing the new settings.
     * @return The updated BackupSettings.
     */
    @Transactional
    public BackupSettings updateBackupSettings(BackupSettingsDTO backupSettingsDTO) {
        BackupSettings settings = getBackupSettings(); // Ensures settings exist
        settings.setAutoBackupInterval(backupSettingsDTO.getAutoBackupInterval());
        settings.setDaysBeforeDelete(backupSettingsDTO.getDaysBeforeDelete());
        return backupSettingsRepository.save(settings);
    }

    /**
     * Updates the last backup time to the current time.
     */
    @Transactional
    public void updateLastBackupTime() {
        BackupSettings settings = getBackupSettings();
        settings.setLastBackupTime(LocalDateTime.now());
        backupSettingsRepository.save(settings);
    }
}