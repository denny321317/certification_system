package com.project.backend.repository;

import com.project.backend.model.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Long> {
    List<ProjectTeam> findByProjectId(Long projectId);
    List<ProjectTeam> findByUserId(Long userId);
    void deleteByProjectIdAndUserId(Long projectId, Long userId);
    ProjectTeam findByProjectIdAndUserId(Long projectId, Long userId);
    
    @Query("SELECT pt FROM ProjectTeam pt LEFT JOIN FETCH pt.duties WHERE pt.project.id = :projectId")
    List<ProjectTeam> findByProjectIdWithDuties(@Param("projectId") Long projectId);
} 