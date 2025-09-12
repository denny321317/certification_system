package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectDetailDTO {
    private Long id;
    private String name;
    private String status;
    private String certType;
    private String startDate;
    private String endDate;
    private String internalReviewDate;
    private String externalReviewDate;
    private String managerId;
    private String agency;
    private int progress;
    private String progressColor;
    private String description;
    private List<TeamMemberDTO> team;
    private List<DocumentDTO> documents;
    private String selectedTemplateId;
    private String checklistState;

    public ProjectDetailDTO(Long id, String name, String status, String certType, String startDate, String endDate,
                            String internalReviewDate, String externalReviewDate, String managerId, String agency,
                            int progress, String progressColor, String description, List<TeamMemberDTO> team,
                            List<DocumentDTO> documents, String selectedTemplateId, String checklistState) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.certType = certType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.internalReviewDate = internalReviewDate;
        this.externalReviewDate = externalReviewDate;
        this.managerId = managerId;
        this.agency = agency;
        this.progress = progress;
        this.progressColor = progressColor;
        this.description = description;
        this.team = team;
        this.documents = documents;
        this.selectedTemplateId = selectedTemplateId;
        this.checklistState = checklistState;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCertType() {
        return certType;
    }

    public void setCertType(String certType) {
        this.certType = certType;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getInternalReviewDate() {
        return internalReviewDate;
    }

    public void setInternalReviewDate(String internalReviewDate) {
        this.internalReviewDate = internalReviewDate;
    }

    public String getExternalReviewDate() {
        return externalReviewDate;
    }

    public void setExternalReviewDate(String externalReviewDate) {
        this.externalReviewDate = externalReviewDate;
    }

    public String getManagerId() {
        return managerId;
    }

    public void setManagerId(String managerId) {
        this.managerId = managerId;
    }

    public String getAgency() {
        return agency;
    }

    public void setAgency(String agency) {
        this.agency = agency;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }

    public String getProgressColor() {
        return progressColor;
    }

    public void setProgressColor(String progressColor) {
        this.progressColor = progressColor;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<TeamMemberDTO> getTeam() {
        return team;
    }

    public void setTeam(List<TeamMemberDTO> team) {
        this.team = team;
    }

    public List<DocumentDTO> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DocumentDTO> documents) {
        this.documents = documents;
    }

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
} 