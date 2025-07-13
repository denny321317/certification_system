package com.project.backend.repository;

import com.project.backend.model.CertificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificationTemplateRepository extends JpaRepository<CertificationTemplate, String> {
    @Override
    List<CertificationTemplate> findAll();
} 