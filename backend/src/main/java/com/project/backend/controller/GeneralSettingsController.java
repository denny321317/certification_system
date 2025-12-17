package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.model.GeneralSettings;
import com.project.backend.service.GeneralSettingsService;

@RestController
@RequestMapping("/api/general-settings")
public class GeneralSettingsController {
    
    @Autowired
    private GeneralSettingsService service;

    @GetMapping
    public GeneralSettings getSettings() {
        return service.getSettings();
    }

    @PutMapping
    public GeneralSettings updateSettings(@RequestBody GeneralSettings settings) {
        return service.updateSettings(settings);
    }
}
