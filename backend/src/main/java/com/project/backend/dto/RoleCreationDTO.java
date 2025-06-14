package com.project.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class RoleCreationDTO {
    
    @NotBlank(message = "Role name cannot be blank")
    private String roleName;

    private boolean[] authorizations;

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public boolean[] getAuthorizations() {
        return authorizations;
    }

    public void setAuthorizations(boolean[] authorizations) {
        this.authorizations = authorizations;
    }

}
