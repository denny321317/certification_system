package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequirementStatusDTO {
    private Long id; // This is the ID of the ProjectRequirementStatus entity
    private Long templateRequirementId;
    private String text;
    private boolean isCompleted;
    private List<DocumentDTO> documents;
}
