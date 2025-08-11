package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.model.SecuritySettings;
import com.project.backend.service.SecuritySettingsService;

@RestController
@RequestMapping("/api/security-settings")
public class SecuritySettingsController {
    
    @Autowired
    private SecuritySettingsService service;

    @GetMapping
    public SecuritySettings getSettings() {
        return service.getSettings();
    }

    @PutMapping
    public SecuritySettings updateSettings(@RequestBody SecuritySettings settings) {
        return service.updateSettings(settings);
    }
}
