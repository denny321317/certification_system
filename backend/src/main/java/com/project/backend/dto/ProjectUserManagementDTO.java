package com.project.backend.dto;



/**
 * This DTO is for the see user detail feature in user management
 */
public class ProjectUserManagementDTO {
    private Long id;
    private String name;
    private String status;

    public ProjectUserManagementDTO(Long id, String name, String status){
        this.id = id;
        this.name = name;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

}
