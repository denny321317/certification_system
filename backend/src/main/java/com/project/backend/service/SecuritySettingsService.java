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

    /**
     * 用於檢查一個密碼是否符合安全設定的要求
     * @param password
     * @param settings
     * @return
     */
    public boolean isPasswordCompliant(String password, SecuritySettings settings) {
        if (settings.isRequireMinLength() && password.length() < settings.getMinLength()) {
            return false;
        }
        if (settings.isRequireUpperLowerCase() && !(password.matches(".*[A-Z].*") && password.matches(".*[a-z].*"))) {
            return false;
        }
        if (settings.isRequireNumber() && !password.matches(".*\\d.*")) {
            return false;
        }
        if (settings.isRequireSpecialChar() && !password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            return false;
        }
        return true;
    }
}
