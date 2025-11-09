package com.project.backend.controller;

import com.project.backend.dto.IssueStatusUpdateDTO;
import com.project.backend.dto.ReviewDTO;
import com.project.backend.dto.ReviewFeedbackDTO;
import com.project.backend.dto.SubmitFeedbackDTO;
import com.project.backend.model.Project;
import com.project.backend.model.NotificationSettings;
import com.project.backend.repository.ProjectRepository;
import com.project.backend.service.NotificationService;
import com.project.backend.service.NotificationSettingsService;
import com.project.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    
    @Autowired
    private NotificationSettingsService notificationSettingsService;

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private NotificationService notificationService;

    @GetMapping("/projects/{projectId}/reviews")
    public ResponseEntity<ReviewFeedbackDTO> getProjectReviews(
            @PathVariable Long projectId,
            @RequestParam(name = "type", defaultValue = "internal") String reviewType) {
        
        ReviewFeedbackDTO reviewFeedback = reviewService.getReviewFeedback(projectId, reviewType);
        return ResponseEntity.ok(reviewFeedback);
    }

    @PostMapping("/projects/{projectId}/reviews")
    @Transactional
    public ResponseEntity<ReviewDTO> submitProjectReview(
            @PathVariable Long projectId,
            @RequestBody SubmitFeedbackDTO submitFeedbackDTO) {
        
        ReviewDTO createdReview = reviewService.createReview(projectId, submitFeedbackDTO);

        Project project = projectRepository.findById(projectId).orElseThrow();
        NotificationSettings settings = notificationSettingsService.getSettings();
        if (settings.isCommentAndReplyNotice()) {
            String message = "New review added to project: '" + project.getName() + "'.";
            List<Long> userIds = project.getTeam().stream().map(pt -> pt.getUser().getId()).collect(Collectors.toList());
            notificationService.createNotification(userIds, -1L,  "Project Update", message);
        }

        return ResponseEntity.ok(createdReview);
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/projects/{projectId}/issues/status")
    public ResponseEntity<Void> updateIssueStatuses(
            @PathVariable Long projectId,
            @RequestBody List<IssueStatusUpdateDTO> issues) {
        reviewService.updateIssueStatuses(issues);
        return ResponseEntity.ok().build();
    }
} 