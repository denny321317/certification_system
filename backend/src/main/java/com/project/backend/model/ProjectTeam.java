package com.project.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "project_team")
public class ProjectTeam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String role; // 團隊成員在此專案的職責

    private String permission; // "view" or "edit"

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_team_duties", joinColumns = @JoinColumn(name = "project_team_id"))
    private java.util.List<String> duties; // 多個職責
    public String getRoleInProject() {
        return role;
    }
} 