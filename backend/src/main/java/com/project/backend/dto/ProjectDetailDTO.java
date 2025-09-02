package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectDetailDTO {
    private Long id;
    private String name;
    private String status;
    private String certType;
    private String startDate;
    private String endDate;
    private String internalReviewDate;
    private String externalReviewDate;
    private String manager;
    private String agency;
    private Integer progress;
    private String progressColor;
    private String description;
    private List<TeamMemberDTO> team;
    private List<DocumentDTO> documents;
    private String progressCalculationMode;
    private List<ProjectRequirementStatusDTO> requirementStatuses;
    private CertificationTemplateDTO certificationTemplate;
} 