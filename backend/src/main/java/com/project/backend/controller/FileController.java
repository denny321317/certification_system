package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.project.backend.model.FileEntity;
import com.project.backend.model.NotificationSettings;
import com.project.backend.model.Project;
import com.project.backend.repository.FileRepository;
import com.project.backend.repository.ProjectRepository;
import com.project.backend.repository.UserRepository;
import com.project.backend.service.NotificationSettingsService;
import com.project.backend.service.NotificationService;
import com.project.backend.service.OperationHistoryService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;


//TODO: Replace "admin" with actual logged-in user

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

    @Autowired
    private NotificationSettingsService notificationSettingsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public FileController() throws IOException {
        Files.createDirectories(fileStorageLocation);
    }

    // 支援多檔案上傳
    @PostMapping("/certification-projects/{projectId}/upload")
    @Transactional
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
            Path categoryFolder = fileStorageLocation.resolve(category);
            Files.createDirectories(categoryFolder);

            List<Map<String, Object>> uploadedFiles = new ArrayList<>();

            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                String originalFilename = file.getOriginalFilename();
                String extension = getExtension(originalFilename);
                String filename = UUID.randomUUID().toString() + "." + extension;

                Path targetPath = categoryFolder.resolve(filename);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

                FileEntity fileEntity = new FileEntity();
                fileEntity.setFilename(category + "/" + filename);
                fileEntity.setOriginalFilename(originalFilename);
                fileEntity.setFileType(extension);
                fileEntity.setUploadTime(LocalDateTime.now());
                fileEntity.setUploadedBy("admin"); // TODO: 實際登入使用者
                fileEntity.setSizeInBytes(file.getSize());
                fileEntity.setStatus("pending");
                fileEntity.setCategory(category);
                fileEntity.setDescription(description);
                fileEntity.setProject(project);

                fileRepository.save(fileEntity);

                // 操作紀錄
                String operator = "admin";
                String details = String.format("上傳了文件 '%s' 到類別 '%s'", originalFilename, category);
                operationHistoryService.recordHistory(projectId, operator, "UPLOAD_DOCUMENT", details);

                // 通知團隊成員
                NotificationSettings settings = notificationSettingsService.getSettings();
                if (settings.isDocumentUpdateNotice()) {
                    String notificationMessage = "新文件 " + originalFilename + " 被上傳到 '" + project.getName() + "'.";
                    List<Long> userIds = project.getTeam().stream()
                            .map(pt -> pt.getUser().getId())
                            .collect(Collectors.toList());
                    notificationService.createNotification(userIds, -1L, "Project Update", notificationMessage);
                }

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
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "檔案上傳失敗"));
        }
    }

    // 下載單檔
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

    // 下載多檔，利用類別分類下載 ZIP
    @GetMapping("/download-category/{category}")
    public ResponseEntity<Resource> downloadCategoryAsZip(@PathVariable String category,
                                                          @RequestParam("projectId") Long projectId) {
        try {
            List<FileEntity> files = fileRepository.findByCategoryAndProjectId(category, projectId);
            if (files.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            String zipFilename = category + "_files.zip";
            Path zipPath = Files.createTempFile(category + "_", ".zip");

            try (FileOutputStream fos = new FileOutputStream(zipPath.toFile());
                 java.util.zip.ZipOutputStream zos = new java.util.zip.ZipOutputStream(fos)) {
                for (FileEntity file : files) {
                    Path filePath = fileStorageLocation.resolve(file.getFilename());
                    if (Files.exists(filePath)) {
                        zos.putNextEntry(new java.util.zip.ZipEntry(file.getOriginalFilename()));
                        Files.copy(filePath, zos);
                        zos.closeEntry();
                    }
                }
            }

            Resource resource = new org.springframework.core.io.UrlResource(zipPath.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + zipFilename + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    // 下載所有文件 (打包 ZIP，用類別分資料夾)
    @GetMapping("/download-category/all")
    public ResponseEntity<?> downloadAllDocuments(@RequestParam("projectId") Long projectId) {
        try {
            List<FileEntity> files = fileRepository.findByProjectId(projectId);

            if (files.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No documents found for this project.");
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(baos);

            // 記錄壓縮檔裡已經用過的檔名，避免重複
            Set<String> entryNames = new HashSet<>();
            int counter = 1;

            for (FileEntity fileEntity : files) {
                // 使用絕對路徑，正確找到 uploads 目錄
                Path filePath = fileStorageLocation.resolve(fileEntity.getFilename()).normalize();
                File file = filePath.toFile();

                if (file.exists()) {
                    // 保留 category 資料夾結構
                    String entryName = fileEntity.getFilename().replace("\\", "/"); // windows 路徑轉斜線

                    // 如果已經出現過，加上流水號避免重複
                    if (entryNames.contains(entryName)) {
                        entryName = counter++ + "_" + entryName;
                    }
                    entryNames.add(entryName);

                    zos.putNextEntry(new ZipEntry(entryName));
                    Files.copy(file.toPath(), zos);
                    zos.closeEntry();
                }
            }
            zos.close();

            byte[] zipBytes = baos.toByteArray();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=all_documents.zip")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(zipBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating zip: " + e.getMessage());
        }
    }

    // 刪除檔案
    @DeleteMapping("/delete/{id}")
    @Transactional
    public ResponseEntity<?> deleteFile(@PathVariable Long id) {
        Optional<FileEntity> optional = fileRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "找不到文件"));
        }

        FileEntity file = optional.get();
        try {
            Files.deleteIfExists(fileStorageLocation.resolve(file.getFilename()));
            fileRepository.delete(file);

            String operator = "admin";
            String details = String.format("刪除了文件 '%s'", file.getOriginalFilename());
            operationHistoryService.recordHistory(file.getProject().getId(), operator, "DELETE_DOCUMENT", details);

            NotificationSettings settings = notificationSettingsService.getSettings();
            if (settings.isDocumentUpdateNotice()) {
                String message = "文件刪除: '" + file.getOriginalFilename() + "' 被從 '" + file.getProject().getName() + "'中刪除";
                List<Long> userIds = file.getProject().getTeam().stream().map(pt -> pt.getUser().getId()).collect(Collectors.toList());
                notificationService.createNotification(userIds, -1L, "Project Update", message);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "刪除成功"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "檔案刪除失敗"));
        }
    }

    // 查詢專案文件
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

    // 建立類別資料夾
    @PostMapping("/create-category")
    public ResponseEntity<?> createCategoryFolder(@RequestParam("category") String category,
                                                  @RequestParam(value = "projectId", required = false) Long projectId) {
        try {
            Path categoryPath = fileStorageLocation.resolve(category).normalize();
            if (!Files.exists(categoryPath)) {
                Files.createDirectories(categoryPath);
            }

            if (projectId != null) {
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

    // 刪除類別資料夾
    @Transactional
    @DeleteMapping("/delete-category")
    public ResponseEntity<?> deleteCategory(@RequestParam("category") String category,
                                            @RequestParam("projectId") Long projectId) {
        try {
            // 1. 取得該類別所有檔案
            List<FileEntity> filesToDelete = fileRepository.findByCategoryAndProjectId(category, projectId);

            // 2. 刪除檔案系統裡的檔案
            for (FileEntity file : filesToDelete) {
                Path filePath = fileStorageLocation.resolve(file.getFilename()).normalize();
                try {
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    System.err.println("Failed to delete file: " + file.getFilename() + " - " + e.getMessage());
                }
            }

            // 3. 刪除資料庫檔案紀錄
            fileRepository.deleteAll(filesToDelete);

            // 4. 刪除整個類別資料夾（遞迴刪除）
            Path categoryFolder = fileStorageLocation.resolve(category).normalize();
            deleteDirectoryRecursively(categoryFolder);

            // 5. 操作紀錄
            String operator = "admin";
            String details = String.format("刪除了文件類別 '%s' 及其包含的 %d 個文件", category, filesToDelete.size());
            operationHistoryService.recordHistory(projectId, operator, "DELETE_CATEGORY", details);

            // 6. 通知團隊
            NotificationSettings settings = notificationSettingsService.getSettings();
            if (settings.isDocumentUpdateNotice()) {
                String message = String.format("文件類別 '%s' 及其 %d 個文件已被刪除", category, filesToDelete.size());
                List<Long> userIds = projectRepository.findById(projectId)
                        .map(p -> p.getTeam().stream().map(pt -> pt.getUser().getId()).toList())
                        .orElse(Collections.emptyList());
                notificationService.createNotification(userIds, -1L, "Project Update", message);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "類別與檔案刪除成功"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "刪除失敗：" + e.getMessage()));
        }
    }

    // 遞迴刪除資料夾工具
    private void deleteDirectoryRecursively(Path path) throws IOException {
        if (Files.exists(path)) {
            Files.walk(path)
                    .sorted(Comparator.reverseOrder()) // 先刪子檔案，再刪父資料夾
                    .forEach(p -> {
                        try {
                            Files.delete(p);
                        } catch (IOException e) {
                            System.err.println("Failed to delete: " + p + " - " + e.getMessage());
                        }
                    });
        }
    }

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

    // 工具
    private String getExtension(String filename) {
        return filename.contains(".")
                ? filename.substring(filename.lastIndexOf('.') + 1)
                : "";
    }

    private boolean isDirEmpty(final Path directory) throws IOException {
        try (DirectoryStream<Path> dirStream = Files.newDirectoryStream(directory)) {
            return !dirStream.iterator().hasNext();
        }
    }
}
