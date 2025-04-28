package com.project.backend.model;


import jakarta.persistence.*;




@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;


    /*Autherisations below */

    @Column(nullable = false)
    private boolean allowSystemSettings = false;

    @Column(nullable = false)
    private boolean allowUserManagment = false;

    @Column(nullable = false)
    private boolean allowDocumentManagment = false;

    @Column(nullable = false)
    private boolean allowTemplateCenter = false;

    @Column(nullable = false)
    private boolean allowCertificationProjects = false;

    @Column(nullable = false)
    private boolean allowReportManagment = false;

    @Column(nullable = false)
    private boolean allowSupplierManagement = false;


    /*Getters and Setters below */
    // Getter for all authorizations
    public boolean[] getAuthorizations() {
        return new boolean[] {
            allowSystemSettings,
            allowUserManagment,
            allowDocumentManagment,
            allowTemplateCenter,
            allowCertificationProjects,
            allowReportManagment,
            allowSupplierManagement
        };
    }

    // Setter for all authorizations
    public void setAuthorizations(boolean[] authorizations) {
        if (authorizations.length != 7) {
            throw new IllegalArgumentException("Authorizations array must have exactly 7 elements.");
        }
        this.allowSystemSettings = authorizations[0];
        this.allowUserManagment = authorizations[1];
        this.allowDocumentManagment = authorizations[2];
        this.allowTemplateCenter = authorizations[3];
        this.allowCertificationProjects = authorizations[4];
        this.allowReportManagment = authorizations[5];
        this.allowSupplierManagement = authorizations[6];
    }

    // Individual getters and setters for name and id
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



    
}