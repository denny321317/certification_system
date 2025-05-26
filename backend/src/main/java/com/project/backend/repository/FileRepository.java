package com.project.backend.repository;

import com.project.backend.model.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<FileEntity, Long> {
    Optional<FileEntity> findByFilename(String filename);
    void deleteByFilename(String filename);
    List<FileEntity> findByProjectId(Long projectId);
    List<FileEntity> findByCategory(String category);

}

