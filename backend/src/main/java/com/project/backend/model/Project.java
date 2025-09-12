package com.project.backend.model;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "progress_calculation_mode")
    private ProgressCalculationMode progressCalculationMode = ProgressCalculationMode.MANUAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private CertificationTemplate certificationTemplate;

    @Column(name = "progress_color")
    private String progressColor;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<ProjectTeam> teamMembers;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectRequirementStatus> requirementStatuses;

    // 這裡用 OneToMany 關聯檔案
    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "project_id")  // file 表裡要有 project_id 外鍵
    private List<FileEntity> documents;

    @Column(name = "selected_template_id")
    private String selectedTemplateId;

    @Lob
    @Column(name = "checklist_state", columnDefinition = "TEXT")
    private String checklistState;


    @ManyToMany(mappedBy = "projects")
    private List<Supplier> suppliers;

    public void setProgress(int progress) {
        this.progress = progress;
    }

    public String getSelectedTemplateId() {
        return selectedTemplateId;
    }

    public void setSelectedTemplateId(String selectedTemplateId) {
        this.selectedTemplateId = selectedTemplateId;
    }

    public String getChecklistState() {
        return checklistState;
    }

    public void setChecklistState(String checklistState) {
        this.checklistState = checklistState;
    }

    public List<ProjectTeam> getTeam() {
        return teamMembers;
    }

}

