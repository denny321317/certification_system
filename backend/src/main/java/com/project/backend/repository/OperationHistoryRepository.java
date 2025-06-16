package com.project.backend.repository;

import com.project.backend.model.OperationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperationHistoryRepository extends JpaRepository<OperationHistory, Long> {
    List<OperationHistory> findByProjectIdOrderByOperationTimeDesc(Long projectId);
} 