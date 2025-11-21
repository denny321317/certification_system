package com.project.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.backend.model.GeneralSettings;

public interface GeneralSettingsRepository extends JpaRepository<GeneralSettings, Long>{
    
}
