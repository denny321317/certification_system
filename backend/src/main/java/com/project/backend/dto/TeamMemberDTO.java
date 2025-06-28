package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeamMemberDTO {
    private Long id;
    private String name;
    private String role;
    private String position; 
    private String email;
    private boolean manager; // 是否為專案負責人
    private String permission; // 權限：view/edit
    private java.util.List<String> duties; // 多個職責
} 