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
import com.project.backend.service.OperationHistoryService;

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

    @Autowired
    private OperationHistoryService operationHistoryService;

    public FileController() throws IOException {
        Files.createDirectories(fileStorageLocation);
    }

    @PostMapping("/certification-projects/{projectId}/upload")
    public ResponseEntity<?> uploadFiles(
            @PathVariable("projectId") Long projectId,
            @RequestParam("files") List<MultipartFile> files,
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

            // 確保類別資料夾存在
            Path categoryFolder = fileStorageLocation.resolve(category);
            Files.createDirectories(categoryFolder);

            List<Map<String, Object>> uploadedFiles = new ArrayList<>();

            for (MultipartFile file : files) {
                if (file.isEmpty()) continue; // 跳過空檔案

                String originalFilename = file.getOriginalFilename();
                String extension = getExtension(originalFilename);
                String filename = UUID.randomUUID().toString() + "." + extension;

                // 儲存到 uploads/category/
                Path targetPath = categoryFolder.resolve(filename);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

                FileEntity fileEntity = new FileEntity();
                fileEntity.setFilename(category + "/" + filename); // 儲存相對路徑
                fileEntity.setOriginalFilename(originalFilename);
                fileEntity.setFileType(extension);
                fileEntity.setUploadTime(LocalDateTime.now());
                fileEntity.setUploadedBy("admin");
                fileEntity.setSizeInBytes(file.getSize());
                fileEntity.setStatus("pending");
                fileEntity.setCategory(category);
                fileEntity.setDescription(description);
                fileEntity.setProject(project);

                fileRepository.save(fileEntity);

                // 記錄歷史 todo 跟登入的人連結
                String operator = "admin";
                String details = String.format("上傳了文件 '%s' 到類別 '%s'", originalFilename, category);
                operationHistoryService.recordHistory(projectId, operator, "UPLOAD_DOCUMENT", details);

                Map<String, Object> fileResponse = new HashMap<>();
                fileResponse.put("id", fileEntity.getId());
                fileResponse.put("name", fileEntity.getOriginalFilename());
                fileResponse.put("filename", fileEntity.getFilename());
                fileResponse.put("category", fileEntity.getCategory());
                fileResponse.put("type", fileEntity.getFileType());
                fileResponse.put("uploadedBy", fileEntity.getUploadedBy());
                fileResponse.put("uploadDate", fileEntity.getUploadTime().toLocalDate().toString());
                fileResponse.put("description", fileEntity.getDescription());
                fileResponse.put("status", fileEntity.getStatus());

                uploadedFiles.add(fileResponse);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "files", uploadedFiles
            ));

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

            // Record history
            // TODO: Replace "admin" with actual logged-in user
            String operator = "admin";
            String details = String.format("刪除了文件 '%s'", file.getOriginalFilename());
            operationHistoryService.recordHistory(file.getProject().getId(), operator, "DELETE_DOCUMENT", details);

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
    public ResponseEntity<?> createCategoryFolder(@RequestParam("category") String category, @RequestParam(value = "projectId", required = false) Long projectId) {
        try {
            // 建立 uploads/category 子資料夾
            Path categoryPath = fileStorageLocation.resolve(category).normalize();
            if (!Files.exists(categoryPath)) {
                Files.createDirectories(categoryPath);
            }

            // Record history - projectId might be null if it's a general category
            if (projectId != null) {
                // TODO: Replace "admin" with actual logged-in user
                String operator = "admin";
                String details = String.format("新增了文件類別 '%s'", category);
                operationHistoryService.recordHistory(projectId, operator, "CREATE_CATEGORY", details);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "類別資料夾已建立"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "無法建立資料夾"));
        }
    }

    //刪除類別資料夾
    @DeleteMapping("/delete-category")
    public ResponseEntity<?> deleteCategory(@RequestParam("category") String category, @RequestParam(value = "projectId", required = true) Long projectId) {
        try {
            // 1. 查找此類別下的所有檔案實體
            List<FileEntity> filesToDelete = fileRepository.findByCategoryAndProjectId(category, projectId);

            // 2. 從檔案系統刪除實體檔案
            for (FileEntity file : filesToDelete) {
                try {
                     Path path = fileStorageLocation.resolve(file.getFilename());
                     Files.deleteIfExists(path);
                } catch (IOException e) {
                    // Log error but continue trying to delete other files and records
                    System.err.println("Failed to delete file from filesystem: " + file.getFilename() + " - " + e.getMessage());
                }
            }

            // 3. 從資料庫刪除檔案紀錄
            fileRepository.deleteAll(filesToDelete);
            
            // 4. 刪除類別資料夾 (如果為空)
            Path categoryFolder = fileStorageLocation.resolve(category);
            if (Files.exists(categoryFolder) && isDirEmpty(categoryFolder)) {
                 Files.delete(categoryFolder);
            }

            // Record history
            // TODO: Replace "admin" with actual logged-in user
            String operator = "admin";
            String details = String.format("刪除了文件類別 '%s' 及其包含的 %d 個文件", category, filesToDelete.size());
            operationHistoryService.recordHistory(projectId, operator, "DELETE_CATEGORY", details);


            return ResponseEntity.ok(Map.of("success", true, "message", "類別與檔案刪除成功"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "刪除失敗：" + e.getMessage()));
        }
    }

    private boolean isDirEmpty(final Path directory) throws IOException {
        try(DirectoryStream<Path> dirStream = Files.newDirectoryStream(directory)) {
            return !dirStream.iterator().hasNext();
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
