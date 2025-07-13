package com.project.backend.repository;

import com.project.backend.model.TemplateRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateRequirementRepository extends JpaRepository<TemplateRequirement, Long> {
} 