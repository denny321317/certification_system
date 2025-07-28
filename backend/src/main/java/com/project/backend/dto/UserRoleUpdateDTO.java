package com.project.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UserRoleUpdateDTO {
    
    @NotNull
    private Long userId;

    @NotBlank
    private String newRoleName;

    // getters and setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getNewRoleName() { return newRoleName; }
    public void setNewRoleName(String newRoleName) { this.newRoleName = newRoleName; }
    

}
