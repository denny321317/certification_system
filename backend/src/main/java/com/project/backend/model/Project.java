package com.project.backend.model;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "project")
public class Project {

    @Id
    private Integer id;

    private String name;

    private String status;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    private String manager;

    private String agency;

    private Integer progress;

    @Column(name = "progress_color")
    private String progressColor;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "project_team", joinColumns = @JoinColumn(name = "project_id"))
    private List<TeamMember> team;

    @ElementCollection
    @CollectionTable(name = "project_timeline", joinColumns = @JoinColumn(name = "project_id"))
    private List<TimelineStage> timeline;

    // 這裡用 OneToMany 關聯檔案
    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "project_id")  // file 表裡要有 project_id 外鍵
    private List<FileEntity> documents;

    @Embeddable
    public static class TeamMember {
        private String name;
        private String role;
        private String email;
        // getters/setters
    }

    @Embeddable
    public static class TimelineStage {
        private String stage;
        private String status;
        private String date;
        @Column(columnDefinition = "TEXT")
        private String description;
        // getters/setters
    }

    // getters and setters...
}

