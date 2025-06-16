package com.project.backend.service;

import com.project.backend.dto.*;
import com.project.backend.model.Project;
import com.project.backend.model.Review;
import com.project.backend.model.ReviewIssue;
import com.project.backend.repository.ProjectRepository;
import com.project.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public ReviewFeedbackDTO getReviewFeedback(Long projectId, String reviewType) {
        List<Review> reviews = reviewRepository.findByProjectIdAndReviewType(projectId, reviewType);

        List<ReviewDTO> reviewDTOs = reviews.stream()
                .map(this::convertToReviewDTO)
                .collect(Collectors.toList());

        // 模擬的進度和步驟，可以後續根據業務邏輯擴充
        String status = "in-progress";
        int progress = 65;
        List<Map<String, String>> reviewSteps = new ArrayList<>();
        reviewSteps.add(Map.of("name", "初步審核", "status", "completed"));
        reviewSteps.add(Map.of("name", "部門主管審核", "status", "in-progress"));
        reviewSteps.add(Map.of("name", "法規符合性審核", "status", "pending"));

        return new ReviewFeedbackDTO(status, progress, reviewSteps, reviewDTOs);
    }
    
    @Transactional
    public ReviewDTO createReview(Long projectId, SubmitFeedbackDTO submitFeedbackDTO) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        Review review = new Review();
        review.setProject(project);
        review.setReviewType(submitFeedbackDTO.getReviewType());
        review.setReviewerName(submitFeedbackDTO.getReviewerName());
        review.setReviewerDepartment(submitFeedbackDTO.getReviewerDepartment());
        review.setDecision(submitFeedbackDTO.getDecision());
        review.setComment(submitFeedbackDTO.getComment());
        
        if (submitFeedbackDTO.getIssues() != null && !submitFeedbackDTO.getIssues().isEmpty()) {
            List<ReviewIssue> issues = submitFeedbackDTO.getIssues().stream()
                .map(issueDTO -> convertToIssueEntity(issueDTO, review))
                .collect(Collectors.toList());
            review.setIssues(issues);
        }

        Review savedReview = reviewRepository.save(review);
        return convertToReviewDTO(savedReview);
    }

    private ReviewDTO convertToReviewDTO(Review review) {
        List<ReviewIssueDTO> issueDTOs = review.getIssues().stream()
                .map(this::convertToIssueDTO)
                .collect(Collectors.toList());

        return new ReviewDTO(
                review.getId(),
                review.getReviewerName(),
                review.getReviewerDepartment(),
                review.getReviewDate(),
                review.getDecision(),
                review.getComment(),
                issueDTOs
        );
    }

    private ReviewIssueDTO convertToIssueDTO(ReviewIssue issue) {
        return new ReviewIssueDTO(
                issue.getId(),
                issue.getTitle(),
                issue.getSeverity(),
                issue.getStatus(),
                issue.getDeadline()
        );
    }
    
    private ReviewIssue convertToIssueEntity(ReviewIssueDTO dto, Review review) {
        ReviewIssue issue = new ReviewIssue();
        issue.setReview(review);
        issue.setTitle(dto.getTitle());
        issue.setSeverity(dto.getSeverity());
        issue.setStatus(dto.getStatus());
        issue.setDeadline(dto.getDeadline());
        return issue;
    }
} 