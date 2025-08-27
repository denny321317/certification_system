package com.project.backend.repository;

import com.project.backend.model.ProjectRequirementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRequirementStatusRepository extends JpaRepository<ProjectRequirementStatus, Long> {
    List<ProjectRequirementStatus> findByProjectId(Long projectId);
    boolean existsByTemplateRequirementId(Long templateRequirementId);
}
