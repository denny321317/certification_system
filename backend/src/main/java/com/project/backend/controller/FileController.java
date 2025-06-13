package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.project.backend.model.FileEntity;
import com.project.backend.model.Project;
import com.project.backend.model.User;
import com.project.backend.repository.FileRepository;
import com.project.backend.repository.ProjectRepository;
import com.project.backend.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.io.File;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:3000")
public class FileController {

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public FileController() throws IOException {
        Files.createDirectories(fileStorageLocation);
    }

    @PostMapping("/certification-projects/{projectId}/upload")
    public ResponseEntity<?> uploadFile(
        @PathVariable("projectId") Long projectId,
        @RequestParam("file") MultipartFile file,
        @RequestParam("category") String category,
        @RequestParam("description") String description
    ) {
        try {
            Optional<Project> optionalProject = projectRepository.findById(projectId);
            if (optionalProject.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "找不到專案"));
            }

            Project project = optionalProject.get();

            String originalFilename = file.getOriginalFilename();
            String extension = getExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + "." + extension;
            // 新增分類資料夾邏輯
            Path categoryFolder = fileStorageLocation.resolve(category);
            Files.createDirectories(categoryFolder); // 若不存在則自動建立

            // 將檔案存入 uploads/category/
            Path targetPath = categoryFolder.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            // Path targetPath = fileStorageLocation.resolve(filename);
            // Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            FileEntity fileEntity = new FileEntity();
            // fileEntity.setFilename(filename);
            fileEntity.setFilename(category + "/" + filename); // 儲存相對路徑，方便下載時定位
            fileEntity.setOriginalFilename(originalFilename);
            fileEntity.setFileType(extension);
            fileEntity.setUploadTime(LocalDateTime.now());
            fileEntity.setUploadedBy("admin");
            fileEntity.setSizeInBytes(file.getSize());
            fileEntity.setStatus("pending");
            fileEntity.setCategory(category);
            fileEntity.setDescription(description);
            fileEntity.setProject(project); // 關聯專案

            fileRepository.save(fileEntity);

            Map<String, Object> response = new HashMap<>();
            response.put("id", fileEntity.getId());
            response.put("name", fileEntity.getOriginalFilename());
            response.put("filename", fileEntity.getFilename());
            response.put("category", fileEntity.getCategory());
            response.put("type", fileEntity.getFileType());
            response.put("uploadedBy", fileEntity.getUploadedBy());
            response.put("uploadDate", fileEntity.getUploadTime().toLocalDate().toString());
            response.put("description", fileEntity.getDescription());
            response.put("status", fileEntity.getStatus());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "檔案上傳失敗"));
        }
    }


    // 下載檔案
    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename, HttpServletRequest request) {
        try {
            Path filePath = fileStorageLocation.resolve(filename).normalize();
            Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 刪除檔案
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id) {
        Optional<FileEntity> optional = fileRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "找不到文件"));
        }

        FileEntity file = optional.get();
        try {
            Files.deleteIfExists(fileStorageLocation.resolve(file.getFilename()));
            fileRepository.delete(file);
            return ResponseEntity.ok(Map.of("success", true, "message", "刪除成功"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "檔案刪除失敗"));
        }
    }

    @GetMapping("/project/{projectId}")    
    public ResponseEntity<?> listDocumentsByProject(@PathVariable Long projectId) {
        List<FileEntity> files = fileRepository.findByProjectId(projectId);

        List<Map<String, Object>> responseList = files.stream().map(file -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", file.getId());
            map.put("name", file.getOriginalFilename());
            map.put("category", file.getCategory());
            map.put("type", file.getFileType());
            map.put("uploadedBy", file.getUploadedBy());
            map.put("uploadDate", file.getUploadTime().toLocalDate().toString());
            map.put("description", file.getDescription());
            map.put("status", file.getStatus());
            return map;
        }).toList();

        return ResponseEntity.ok(responseList);
    }



    // 工具：檔案大小格式化
    private String formatFileSize(long sizeInBytes) {
        double sizeInMB = sizeInBytes / (1024.0 * 1024.0);
        return String.format("%.1f MB", sizeInMB);
    }

    // 工具：取得副檔名
    private String getExtension(String filename) {
        return filename.contains(".")
                ? filename.substring(filename.lastIndexOf('.') + 1)
                : "";
    }

    //新增類別資料夾
    @PostMapping("/create-category")
    public ResponseEntity<?> createCategoryFolder(@RequestParam("category") String category) {
        try {
            // 建立 uploads/category 子資料夾
            Path categoryPath = fileStorageLocation.resolve(category).normalize();
            if (!Files.exists(categoryPath)) {
                Files.createDirectories(categoryPath);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "類別資料夾已建立"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "無法建立資料夾"));
        }
    }

    //刪除類別資料夾
    @DeleteMapping("/delete-category")
    public ResponseEntity<?> deleteCategory(@RequestParam("category") String category) {
        try {
            // 1. 刪除資料夾下所有檔案（如有記錄）
            List<FileEntity> filesToDelete = fileRepository.findByCategory(category);
            for (FileEntity file : filesToDelete) {
                Path path = Paths.get("uploads", category, file.getFilename());
                Files.deleteIfExists(path);
            }

            // 2. 刪除資料夾本身
            Path categoryFolder = Paths.get("uploads", category);
            if (Files.exists(categoryFolder)) {
                Files.delete(categoryFolder); // 若非空資料夾會拋出 DirectoryNotEmptyException
            }

            // 3. 刪除資料庫紀錄
            fileRepository.deleteAll(filesToDelete);

            return ResponseEntity.ok(Map.of("success", true, "message", "類別與檔案刪除成功"));
        } catch (DirectoryNotEmptyException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "資料夾非空，請先刪除所有檔案"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "刪除失敗：" + e.getMessage()));
        }
    }

    //取得所有存在的類別資料夾名稱
    @GetMapping("/categories")
    public ResponseEntity<?> listCategories() {
        try {
            File folder = new File("uploads");
            if (!folder.exists()) {
                folder.mkdirs();
            }

            File[] subdirs = folder.listFiles(File::isDirectory);
            List<String> categoryList = new ArrayList<>();

            if (subdirs != null) {
                for (File dir : subdirs) {
                    categoryList.add(dir.getName());
                }
            }

            return ResponseEntity.ok(categoryList);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "讀取類別資料夾失敗"));
        }
    }




}
