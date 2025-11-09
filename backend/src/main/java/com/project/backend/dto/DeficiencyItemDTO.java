package com.project.backend.dto;

import java.time.LocalDate;

public class DeficiencyItemDTO {
    private String issueName;
    private String certType;
    private String severity;
    private LocalDate discoveryDate;
    private String status;

    // Constructors
    public DeficiencyItemDTO() {
    }

    public DeficiencyItemDTO(String issueName, String certType, String severity, LocalDate discoveryDate, String status) {
        this.issueName = issueName;
        this.certType = certType;
        this.severity = severity;
        this.discoveryDate = discoveryDate;
        this.status = status;
    }

    // Getters and Setters
    public String getIssueName() {
        return issueName;
    }

    public void setIssueName(String issueName) {
        this.issueName = issueName;
    }

    public String getCertType() {
        return certType;
    }

    public void setCertType(String certType) {
        this.certType = certType;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public LocalDate getDiscoveryDate() {
        return discoveryDate;
    }

    public void setDiscoveryDate(LocalDate discoveryDate) {
        this.discoveryDate = discoveryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
