
package com.project.backend.repository;

import com.project.backend.model.BackupSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BackupSettingsRepository extends JpaRepository<BackupSettings, Long> {
}