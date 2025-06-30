package com.project.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class UserDetailDTO {
    private Long id;
    private String name;
    private String email;
    private RoleDTO role;
    private String department;
    private LocalDateTime lastTimeLogin;
    private boolean online;
    private List<ProjectTeamDTO> projectMemberships;
    private boolean suspended;

    public UserDetailDTO(
        Long id,
        String name,
        String email,
        RoleDTO role,
        String department,
        LocalDateTime lastTimeLogin,
        boolean online,
        List<ProjectTeamDTO> projectMemberships,
        boolean suspended
    ) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.email = email;
        this.role = role;
        this.lastTimeLogin = lastTimeLogin;
        this.online = online;
        this.projectMemberships = projectMemberships;
        this.suspended = suspended;
    }

    // Getters and Setters for all fields
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public RoleDTO getRole() { return role; }
    public void setRole(RoleDTO role) { this.role = role; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LocalDateTime getLastTimeLogin() { return lastTimeLogin; }
    public void setLastTimeLogin(LocalDateTime lastTimeLogin) { this.lastTimeLogin = lastTimeLogin; }
    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }
    public List<ProjectTeamDTO> getProjectMemberships() { return projectMemberships; }
    public void setProjectMemberships(List<ProjectTeamDTO> projectMemberships) { this.projectMemberships = projectMemberships; }
    public boolean getSuspended(){ return suspended; }
    public void setSuspended(boolean suspended) { this.suspended = suspended; }

}
