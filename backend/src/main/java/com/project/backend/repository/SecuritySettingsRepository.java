package com.project.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.backend.model.SecuritySettings;

public interface SecuritySettingsRepository extends JpaRepository<SecuritySettings, Long> {
    
}
