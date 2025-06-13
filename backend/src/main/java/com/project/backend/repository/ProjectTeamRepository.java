package com.project.backend.repository;

import com.project.backend.model.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Long> {
    List<ProjectTeam> findByProjectId(Long projectId);
    List<ProjectTeam> findByUserId(Long userId);
    void deleteByProjectIdAndUserId(Long projectId, Long userId);
    ProjectTeam findByProjectIdAndUserId(Long projectId, Long userId);
} 