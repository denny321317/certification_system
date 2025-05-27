package com.project.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true) // Added unique = true for role names
    private String name;

    /*Authorizations below - now with Read/Write separation */

    // System Settings
    @Column(nullable = false)
    private boolean allowReadSystemSettings = false;
    @Column(nullable = false)
    private boolean allowWriteSystemSettings = false;

    // User Management
    @Column(nullable = false)
    private boolean allowReadUserManagment = false;
    @Column(nullable = false)
    private boolean allowWriteUserManagment = false;

    // Document Management
    @Column(nullable = false)
    private boolean allowReadDocumentManagment = false;
    @Column(nullable = false)
    private boolean allowWriteDocumentManagment = false;

    // Template Center
    @Column(nullable = false)
    private boolean allowReadTemplateCenter = false;
    @Column(nullable = false)
    private boolean allowWriteTemplateCenter = false;

    // Certification Projects
    @Column(nullable = false)
    private boolean allowReadCertificationProjects = false;
    @Column(nullable = false)
    private boolean allowWriteCertificationProjects = false;

    // Report Management
    @Column(nullable = false)
    private boolean allowReadReportManagment = false;
    @Column(nullable = false)
    private boolean allowWriteReportManagment = false;

    // Supplier Management
    @Column(nullable = false)
    private boolean allowReadSupplierManagement = false;
    @Column(nullable = false)
    private boolean allowWriteSupplierManagement = false;

    // Dashboard
    @Column(nullable = false)
    private boolean allowReadDashboard = false;
    @Column(nullable = false)
    private boolean allowWriteDashboard = false;

    /*Getters and Setters below */

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

    // Getter for all authorizations (now 16 elements: read, write for each of 8 categories)
    public boolean[] getAuthorizations() {
        return new boolean[]{
                allowReadSystemSettings, allowWriteSystemSettings,
                allowReadUserManagment, allowWriteUserManagment,
                allowReadDocumentManagment, allowWriteDocumentManagment,
                allowReadTemplateCenter, allowWriteTemplateCenter,
                allowReadCertificationProjects, allowWriteCertificationProjects,
                allowReadReportManagment, allowWriteReportManagment,
                allowReadSupplierManagement, allowWriteSupplierManagement,
                allowReadDashboard, allowWriteDashboard
        };
    }

    // Setter for all authorizations (expects 16 elements)
    public void setAuthorizations(boolean[] authorizations) {
        if (authorizations == null || authorizations.length != 16) {
            throw new IllegalArgumentException("Authorizations array must have exactly 16 elements (read/write for 8 categories).");
        }
        this.allowReadSystemSettings = authorizations[0];
        this.allowWriteSystemSettings = authorizations[1];
        this.allowReadUserManagment = authorizations[2];
        this.allowWriteUserManagment = authorizations[3];
        this.allowReadDocumentManagment = authorizations[4];
        this.allowWriteDocumentManagment = authorizations[5];
        this.allowReadTemplateCenter = authorizations[6];
        this.allowWriteTemplateCenter = authorizations[7];
        this.allowReadCertificationProjects = authorizations[8];
        this.allowWriteCertificationProjects = authorizations[9];
        this.allowReadReportManagment = authorizations[10];
        this.allowWriteReportManagment = authorizations[11];
        this.allowReadSupplierManagement = authorizations[12];
        this.allowWriteSupplierManagement = authorizations[13];
        this.allowReadDashboard = authorizations[14];
        this.allowWriteDashboard = authorizations[15];
    }

    // Individual getters and setters for each permission

    public boolean isAllowReadSystemSettings() {
        return allowReadSystemSettings;
    }

    public void setAllowReadSystemSettings(boolean allowReadSystemSettings) {
        this.allowReadSystemSettings = allowReadSystemSettings;
    }

    public boolean isAllowWriteSystemSettings() {
        return allowWriteSystemSettings;
    }

    public void setAllowWriteSystemSettings(boolean allowWriteSystemSettings) {
        this.allowWriteSystemSettings = allowWriteSystemSettings;
    }

    public boolean isAllowReadUserManagment() {
        return allowReadUserManagment;
    }

    public void setAllowReadUserManagment(boolean allowReadUserManagment) {
        this.allowReadUserManagment = allowReadUserManagment;
    }

    public boolean isAllowWriteUserManagment() {
        return allowWriteUserManagment;
    }

    public void setAllowWriteUserManagment(boolean allowWriteUserManagment) {
        this.allowWriteUserManagment = allowWriteUserManagment;
    }

    public boolean isAllowReadDocumentManagment() {
        return allowReadDocumentManagment;
    }

    public void setAllowReadDocumentManagment(boolean allowReadDocumentManagment) {
        this.allowReadDocumentManagment = allowReadDocumentManagment;
    }

    public boolean isAllowWriteDocumentManagment() {
        return allowWriteDocumentManagment;
    }

    public void setAllowWriteDocumentManagment(boolean allowWriteDocumentManagment) {
        this.allowWriteDocumentManagment = allowWriteDocumentManagment;
    }

    public boolean isAllowReadTemplateCenter() {
        return allowReadTemplateCenter;
    }

    public void setAllowReadTemplateCenter(boolean allowReadTemplateCenter) {
        this.allowReadTemplateCenter = allowReadTemplateCenter;
    }

    public boolean isAllowWriteTemplateCenter() {
        return allowWriteTemplateCenter;
    }

    public void setAllowWriteTemplateCenter(boolean allowWriteTemplateCenter) {
        this.allowWriteTemplateCenter = allowWriteTemplateCenter;
    }

    public boolean isAllowReadCertificationProjects() {
        return allowReadCertificationProjects;
    }

    public void setAllowReadCertificationProjects(boolean allowReadCertificationProjects) {
        this.allowReadCertificationProjects = allowReadCertificationProjects;
    }

    public boolean isAllowWriteCertificationProjects() {
        return allowWriteCertificationProjects;
    }

    public void setAllowWriteCertificationProjects(boolean allowWriteCertificationProjects) {
        this.allowWriteCertificationProjects = allowWriteCertificationProjects;
    }

    public boolean isAllowReadReportManagment() {
        return allowReadReportManagment;
    }

    public void setAllowReadReportManagment(boolean allowReadReportManagment) {
        this.allowReadReportManagment = allowReadReportManagment;
    }

    public boolean isAllowWriteReportManagment() {
        return allowWriteReportManagment;
    }

    public void setAllowWriteReportManagment(boolean allowWriteReportManagment) {
        this.allowWriteReportManagment = allowWriteReportManagment;
    }

    public boolean isAllowReadSupplierManagement() {
        return allowReadSupplierManagement;
    }

    public void setAllowReadSupplierManagement(boolean allowReadSupplierManagement) {
        this.allowReadSupplierManagement = allowReadSupplierManagement;
    }

    public boolean isAllowWriteSupplierManagement() {
        return allowWriteSupplierManagement;
    }

    public void setAllowWriteSupplierManagement(boolean allowWriteSupplierManagement) {
        this.allowWriteSupplierManagement = allowWriteSupplierManagement;
    }

    public boolean isAllowReadDashboard() {
        return allowReadDashboard;
    }

    public void setAllowReadDashboard(boolean allowReadDashboard) {
        this.allowReadDashboard = allowReadDashboard;
    }

    public boolean isAllowWriteDashboard() {
        return allowWriteDashboard;
    }

    public void setAllowWriteDashboard(boolean allowWriteDashboard) {
        this.allowWriteDashboard = allowWriteDashboard;
    }
}