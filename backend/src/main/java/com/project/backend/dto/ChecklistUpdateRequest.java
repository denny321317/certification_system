package com.project.backend.dto;

import java.util.List;
import java.util.Map;

public class ChecklistUpdateRequest {
    private String selectedTemplateId;
    private List<Map<String, Object>> requirements;
    private int progress;

    // Getters and Setters
    public String getSelectedTemplateId() {
        return selectedTemplateId;
    }

    public void setSelectedTemplateId(String selectedTemplateId) {
        this.selectedTemplateId = selectedTemplateId;
    }

    public List<Map<String, Object>> getRequirements() {
        return requirements;
    }

    public void setRequirements(List<Map<String, Object>> requirements) {
        this.requirements = requirements;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }
}
