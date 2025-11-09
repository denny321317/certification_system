package com.project.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long id;
    private String reviewer;
    private String reviewerDepartment;
    private LocalDateTime date;
    private String decision;
    private String comment;
    private List<ReviewIssueDTO> issues;
} 