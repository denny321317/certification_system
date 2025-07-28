package com.project.backend.repository;

import com.project.backend.model.TemplateDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateDocumentRepository extends JpaRepository<TemplateDocument, Long> {
} 