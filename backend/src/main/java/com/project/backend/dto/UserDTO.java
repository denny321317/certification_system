package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String position;
    private String email;
    private String departement;
    private RoleDTO roleDTO;


    public UserDTO(Long id, String name, String position) {
        this.id = id;
        this.name = name;
        this.position = position;
    }
} 