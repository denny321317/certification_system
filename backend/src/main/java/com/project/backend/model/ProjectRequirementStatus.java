package com.project.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "project_requirement_status")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequirementStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference("project-requirement-status")
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "template_requirement_id", nullable = false)
    private TemplateRequirement templateRequirement;

    @Column(name = "is_completed", nullable = false)
    private boolean isCompleted = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
