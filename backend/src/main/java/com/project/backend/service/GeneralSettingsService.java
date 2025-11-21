package com.project.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.project.backend.model.GeneralSettings;
import com.project.backend.repository.GeneralSettingsRepository;

@Service
public class GeneralSettingsService {
    
    @Autowired
    private GeneralSettingsRepository repository;

    private static final Long SETTINGS_ID = 1L;

    public GeneralSettings getSettings() {
        return repository.findById(SETTINGS_ID).orElseGet(() -> {
            GeneralSettings defaults = new GeneralSettings();
            defaults.setId(SETTINGS_ID);
            defaults.setSystemName("企業認證資料整合系統");
            defaults.setSystemLanguage("繁體中文");
            defaults.setTimezone("Asia/Taipei");
            defaults.setDateFormat("YYYY-MM-DD");
            return defaults;
        });
    }

    public GeneralSettings updateSettings(GeneralSettings newSettings) {
        newSettings.setId(SETTINGS_ID);
        return repository.save(newSettings);
    }

}
