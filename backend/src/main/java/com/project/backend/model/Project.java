package com.project.backend.model;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "project")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 確保自動生成主鍵
    private Long id;
    
    private String name;
    private String status;
    private String certType;

    @Column(name = "start_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    @Column(name = "end_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate internalReviewDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate externalReviewDate;

    @Column(name = "manager_id")
    private Long managerId; // 指向專案負責人 user 的 id

    private String agency;
    private Integer progress;

    @Column(name = "progress_color")
    private String progressColor;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "project_user",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> users;

    // 這裡用 OneToMany 關聯檔案
    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "project_id")  // file 表裡要有 project_id 外鍵
    private List<FileEntity> documents;


}

