package com.project.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    public Optional<Project> findById(Long id);
    
    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.requirementStatuses WHERE p.id = :id")
    Optional<Project> findByIdWithRequirementStatuses(@Param("id") Long id);
}
