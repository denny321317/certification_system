package com.project.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitFeedbackDTO {
    private String reviewType; // "internal" or "external"
    private String reviewerName;
    private String reviewerDepartment;
    private String decision;
    private String comment;
    private List<ReviewIssueDTO> issues;
} 