package com.project.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewIssueDTO {
    private Long id;
    private String title;
    private String severity;
    private String status;
    private LocalDateTime deadline;
} 