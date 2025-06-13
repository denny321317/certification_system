package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeamMemberDTO {
    private String name;
    private String role;
    private String email;
    private boolean manager; // 是否為專案負責人
} 