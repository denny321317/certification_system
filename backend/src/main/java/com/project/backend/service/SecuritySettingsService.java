package com.project.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.backend.model.SecuritySettings;
import com.project.backend.repository.SecuritySettingsRepository;

@Service
public class SecuritySettingsService {
    @Autowired
    private SecuritySettingsRepository repository;

    public SecuritySettings getSettings() {
        return repository.findById(1L).orElse(new SecuritySettings());
    }


    public SecuritySettings updateSettings(SecuritySettings settings) {
        settings.setId(1L); // There will only be one data row in this table
        return repository.save(settings);
    }
}
