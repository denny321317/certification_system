package com.project.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.backend.model.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
  
}
