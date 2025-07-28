package com.project.backend.service;

import com.project.backend.model.FileEntity;
import com.project.backend.repository.FileRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    private FileRepository fileRepository;

    public String storeFile(MultipartFile file) {
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = getExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + "_" + originalFilename;

            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            Path targetLocation = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            FileEntity fileEntity = new FileEntity();
            fileEntity.setFilename(filename);
            fileEntity.setOriginalFilename(originalFilename);
            fileEntity.setFileType(extension);
            fileEntity.setUploadTime(LocalDateTime.now());
            fileEntity.setUploadedBy("admin"); // 可替換為登入者
            fileEntity.setSizeInBytes(file.getSize());
            fileEntity.setStatus("已上傳");

            fileRepository.save(fileEntity);

            return filename;
        } catch (IOException e) {
            throw new RuntimeException("無法儲存檔案: " + e.getMessage());
        }
    }

    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().resolve(filename).normalize();
            if (!Files.exists(filePath)) {
                throw new RuntimeException("檔案不存在");
            }
            return new FileSystemResource(filePath);
        } catch (Exception e) {
            throw new RuntimeException("無法讀取檔案: " + e.getMessage());
        }
    }

    public boolean deleteFile(String filename) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().resolve(filename).normalize();
            Files.deleteIfExists(filePath);

            Optional<FileEntity> fileOpt = fileRepository.findByFilename(filename);
            fileOpt.ifPresent(fileRepository::delete);

            return true;
        } catch (IOException e) {
            return false;
        }
    }

    private String getExtension(String filename) {
        return filename.contains(".") ? filename.substring(filename.lastIndexOf('.') + 1) : "";
    }
}
