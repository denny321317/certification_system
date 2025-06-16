package com.project.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewFeedbackDTO {
    private String status;
    private int progress;
    private List<Map<String, String>> reviewSteps;
    private List<ReviewDTO> reviews;
} 