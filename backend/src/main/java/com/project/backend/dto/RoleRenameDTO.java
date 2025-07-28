package com.project.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class RoleRenameDTO {
 
    @NotBlank(message = "New role name cannot be blank")
    private String newName;

    public RoleRenameDTO(String newName) {
        this.newName = newName;
    }

    public String getNewName() {
        return newName;
    }

    public void setNewName(String newName) {
        this.newName = newName;
    }


}
