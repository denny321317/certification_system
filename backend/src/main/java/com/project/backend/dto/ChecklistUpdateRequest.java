package com.project.backend.dto;

import java.util.List;
import java.util.Map;

public class ChecklistUpdateRequest {
    private String selectedTemplateId;
    private String checklistState;
    private int progress;

    // Getters and Setters
    public String getSelectedTemplateId() {
        return selectedTemplateId;
    }

    public void setSelectedTemplateId(String selectedTemplateId) {
        this.selectedTemplateId = selectedTemplateId;
    }

    public String getChecklistState() {
        return checklistState;
    }

    public void setChecklistState(String checklistState) {
        this.checklistState = checklistState;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }
}
