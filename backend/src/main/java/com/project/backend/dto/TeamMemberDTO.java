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
    private String role; // 新增：團隊成員職責
    private String email;
    private boolean manager; // 是否為專案負責人
} 