package com.project.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "project_team")
public class ProjectTeam {

    @EmbeddedId
    private ProjectTeamId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("project")
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("user")
    @JoinColumn(name = "user_id")
    private User user;

    private String role; // 團隊成員在此專案的職責

    private String permission; // "view" or "edit"

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_team_duties", joinColumns = {
            @JoinColumn(name = "project_id", referencedColumnName = "project_id"),
            @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    })
    private java.util.List<String> duties; // 多個職責
} 