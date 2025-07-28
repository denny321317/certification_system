package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificationTemplateDTO {
    private String id;
    private String displayName;
    private String description;
    private List<TemplateRequirementDTO> requirements;
} 