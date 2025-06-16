package com.project.backend.controller;

import com.project.backend.dto.ReviewDTO;
import com.project.backend.dto.ReviewFeedbackDTO;
import com.project.backend.dto.SubmitFeedbackDTO;
import com.project.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/projects/{projectId}/reviews")
    public ResponseEntity<ReviewFeedbackDTO> getProjectReviews(
            @PathVariable Long projectId,
            @RequestParam(name = "type", defaultValue = "internal") String reviewType) {
        
        ReviewFeedbackDTO reviewFeedback = reviewService.getReviewFeedback(projectId, reviewType);
        return ResponseEntity.ok(reviewFeedback);
    }

    @PostMapping("/projects/{projectId}/reviews")
    public ResponseEntity<ReviewDTO> submitProjectReview(
            @PathVariable Long projectId,
            @RequestBody SubmitFeedbackDTO submitFeedbackDTO) {
        
        ReviewDTO createdReview = reviewService.createReview(projectId, submitFeedbackDTO);
        return ResponseEntity.ok(createdReview);
    }
} 