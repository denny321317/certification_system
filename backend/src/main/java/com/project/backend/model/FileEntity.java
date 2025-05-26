package com.project.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "files")
@Entity
public class FileEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filename;           // 系統檔名（含 UUID）
    private String originalFilename;   // 顯示名稱
    private String fileType;           // 副檔名或
    private LocalDateTime uploadTime;
    private String uploadedBy;         // 與 User 關聯
    private Long sizeInBytes;
    private String status;
    private String category;
    private String description;
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;


}
