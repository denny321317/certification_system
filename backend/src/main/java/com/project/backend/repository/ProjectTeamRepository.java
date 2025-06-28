package com.project.backend.repository;

import com.project.backend.model.ProjectTeam;
import com.project.backend.model.ProjectTeamId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, ProjectTeamId> {
    
    @Query("SELECT pt FROM ProjectTeam pt LEFT JOIN FETCH pt.user LEFT JOIN FETCH pt.project WHERE pt.id.project = :projectId")
    List<ProjectTeam> findByProjectIdWithDetails(@Param("projectId") Long projectId);
} 