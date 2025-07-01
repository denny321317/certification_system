package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleDTO {
    private Long id;
    private String name;
    // add infos about authorisations here if needed in the future
    private Boolean allowReadSystemSettings;
    private Boolean allowWriteSystemSettings;
    private Boolean allowReadUserManagment;
    private Boolean allowWriteUserManagment;
    private Boolean allowReadDocumentManagment;
    private Boolean allowWriteDocumentManagment;
    private Boolean allowReadTemplateCenter;
    private Boolean allowWriteTemplateCenter;
    private Boolean allowReadCertificationProjects;
    private Boolean allowWriteCertificationProjects;
    private Boolean allowReadReportManagment;
    private Boolean allowWriteReportManagment;
    private Boolean allowReadSupplierManagement;
    private Boolean allowWriteSupplierManagement;
    private Boolean allowReadDashboard;
    private Boolean allowWriteDashboard;


    public RoleDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
