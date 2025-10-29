package com.project.backend.repository;

import com.project.backend.model.ReviewIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewIssueRepository extends JpaRepository<ReviewIssue, Long> {
    Optional<ReviewIssue> findById(Long id);
} 