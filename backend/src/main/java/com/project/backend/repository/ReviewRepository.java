package com.project.backend.repository;

import com.project.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProjectIdAndReviewType(Long projectId, String reviewType);
} 