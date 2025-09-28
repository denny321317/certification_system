package com.project.backend.controller;

import com.project.backend.dto.ReviewDTO;
import com.project.backend.dto.ReviewFeedbackDTO;
import com.project.backend.dto.SubmitFeedbackDTO;
import com.project.backend.model.NotificationSettings;
import com.project.backend.model.Project;
import com.project.backend.model.ProjectTeam;
import com.project.backend.repository.ProjectRepository;
import com.project.backend.repository.UserRepository;
import com.project.backend.service.NotificationService;
import com.project.backend.service.NotificationSettingsService;
import com.project.backend.service.ReviewService;

import jakarta.transaction.Transactional;

import com.project.backend.model.User;
import lombok.RequiredArgsConstructor;

import java.util.stream.Collectors;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @Autowired
    private NotificationSettingsService notificationSettingsService;

    @Autowired
    private UserRepository userRepository;

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

        // Add notification logic
        Project project = projectRepository.findById(projectId).orElseThrow();
        NotificationSettings settings = notificationSettingsService.getSettings();
        if (settings.isCommentAndReplyNotice()) {
            String message = "New review added to project: '" + project.getName() + "'.";
            List<Long> userIds = project.getTeam().stream().map(pt -> pt.getUser().getId()).collect(Collectors.toList());
            notificationService.createNotification(userIds, -1L,  "Project Update", message);
        }

        return ResponseEntity.ok(createdReview);
    }
} 