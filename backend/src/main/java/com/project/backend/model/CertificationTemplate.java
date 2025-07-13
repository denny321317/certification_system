package com.project.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Table(name = "certification_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificationTemplate {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<TemplateRequirement> requirements;
} 