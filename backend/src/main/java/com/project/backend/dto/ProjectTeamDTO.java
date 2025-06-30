package com.project.backend.dto;


/**
 * This DTO is for features in user management
 */

public class ProjectTeamDTO {
    private Long projectTeamId;
    private ProjectUserManagementDTO project;
    private String roleInProject;

    public ProjectTeamDTO(Long projectTeamId, ProjectUserManagementDTO project, String roleInProject){
        this.projectTeamId = projectTeamId;
        this.project = project;
        this.roleInProject = roleInProject;
    }

    // Getters and Setters
    public Long getProjectTeamId() { return projectTeamId; }
    public void setProjectTeamId(Long projectTeamId) { this.projectTeamId = projectTeamId; }
    public ProjectUserManagementDTO getProject() { return project; }
    public void setProject(ProjectUserManagementDTO project) { this.project = project; }
    public String getRoleInProject() { return roleInProject; }
    public void setRoleInProject(String roleInProject) { this.roleInProject = roleInProject; }
}
