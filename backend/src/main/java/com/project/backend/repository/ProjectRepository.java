package com.project.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    public Optional<Project> findById(Long id);
}
