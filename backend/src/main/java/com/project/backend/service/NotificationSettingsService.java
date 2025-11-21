package com.project.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.backend.model.NotificationSettings;
import com.project.backend.model.SecuritySettings;
import com.project.backend.repository.NotificationSettingsRepository;

@Service
public class NotificationSettingsService {

    @Autowired
    private NotificationSettingsRepository repository;

    public NotificationSettings getSettings() {
        return repository.findById(1L).orElse(new NotificationSettings());
    }

    public NotificationSettings updateSettings(NotificationSettings updatedSettings) {
        // 1. Fetch the existing settings from the database, or create a new one if it doesn't exist.
        NotificationSettings existingSettings = repository.findById(1L).orElse(new NotificationSettings());
        existingSettings.setId(1L); // Ensure ID is set for new instances

        // 2. Manually update only the fields that are part of the update logic.
        //    This prevents null/default values from overwriting existing data.
        existingSettings.setCertificationExpireNotice(updatedSettings.isCertificationExpireNotice());
        existingSettings.setDaysBeforeExpirarySendNotice(updatedSettings.getDaysBeforeExpirarySendNotice());
        existingSettings.setNewProjectNotice(updatedSettings.isNewProjectNotice());
        existingSettings.setDocumentUpdateNotice(updatedSettings.isDocumentUpdateNotice());
        existingSettings.setMissionAssignmentNotice(updatedSettings.isMissionAssignmentNotice());
        existingSettings.setCommentAndReplyNotice(updatedSettings.isCommentAndReplyNotice());

        // 3. Save the merged object.
        return repository.save(existingSettings);
    }  
    
}
