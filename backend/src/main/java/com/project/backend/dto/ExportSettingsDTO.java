package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExportSettingsDTO {
    private Long projectId;
    private String format; // pdf, excel, word
    private boolean includeBasicInfo;
    private boolean includeTeamInfo;
    private boolean includeDocuments;
    private boolean includeReviews;
    private boolean includeHistory;
    private boolean includeCharts;
    private String notes;
}
