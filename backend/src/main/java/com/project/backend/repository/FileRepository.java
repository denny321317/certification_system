package com.project.backend.repository;

import com.project.backend.model.FileEntity;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<FileEntity, Long> {
    Optional<FileEntity> findByFilename(String filename);
    void deleteByFilename(String filename);
    List<FileEntity> findByProjectId(Long projectId);
    List<FileEntity> findByCategory(String category);
    List<FileEntity> findByCategoryAndProjectId(String category, Long projectId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM FileEntity f WHERE f.id = :id")
    int deleteFileById(@Param("id") Long id);
}

