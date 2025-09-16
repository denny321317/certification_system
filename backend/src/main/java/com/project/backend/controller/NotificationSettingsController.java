package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.model.NotificationSettings;
import com.project.backend.service.NotificationSettingsService;

@RestController
@RequestMapping("/api/notification-settings")
public class NotificationSettingsController {
    
    @Autowired
    private NotificationSettingsService service;

    @GetMapping("/getSettings")
    public NotificationSettings getSettings() {
        return service.getSettings();
    }

    @PutMapping("/putSettings") 
    public NotificationSettings updateSettings(@RequestBody NotificationSettings settings) {
        return service.updateSettings(settings);
    }
}
