package com.project.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.backend.model.DocumentCategory;

public interface DocumentCategoryRepository extends JpaRepository<DocumentCategory, String> {

}
