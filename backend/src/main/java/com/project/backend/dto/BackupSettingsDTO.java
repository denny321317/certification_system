package com.project.backend.dto;

import lombok.Data;

@Data
public class BackupSettingsDTO {
    private int autoBackupInterval;
    private int daysBeforeDelete;
}