package com.project.backend.repository;

import com.project.backend.model.ReviewIssue;
import com.project.backend.dto.DeficiencyItemDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewIssueRepository extends JpaRepository<ReviewIssue, Long> {
    Optional<ReviewIssue> findById(Long id);

    List<ReviewIssue> findByReviewId(Long reviewId);

    @Query("SELECT new com.project.backend.dto.DeficiencyItemDTO(" +
           "ri.title, " +
           "r.project.certType, " +
           "ri.severity, " +
           "cast(ri.createdAt as java.time.LocalDate), " +
           "ri.status) " +
           "FROM ReviewIssue ri JOIN ri.review r")
    List<DeficiencyItemDTO> findDeficiencyItems();
} 