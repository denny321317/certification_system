package com.project.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.backend.model.NotificationSettings;

public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, Long>{
    
}
