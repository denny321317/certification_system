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
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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
                String baseName = getBaseNameWithoutVersion(originalFilename);

                // 取得同一 project + category 下的所有檔案來比對（repository method 已存在 findByCategoryAndProjectId）
                List<FileEntity> sameCategoryFiles = fileRepository.findByCategoryAndProjectId(category, projectId);

                int maxVersion = findMaxExistingVersion(sameCategoryFiles, baseName);

                // 如果找到同名，newVersion = maxVersion + 1；否則 newVersion = 0（表示沒有版本字尾）
                int newVersion = (maxVersion > 0) ? (maxVersion + 1) : (sameCategoryFiles.stream()
                        .anyMatch(f -> stripExtension(f.getOriginalFilename()).equals(baseName) ) ? 2 : 0);

                // 決定要存入 DB 的 originalFilename（顯示名稱）
                String displayOriginalName;
                if (newVersion == 0) {
                    displayOriginalName = originalFilename; // 沒有衝突
                } else {
                    // 若原始檔名已包含 extension，保留副檔名在最後
                    String extPart = extension.isEmpty() ? "" : "." + extension;
                    displayOriginalName = baseName + " v" + newVersion + extPart;
                }

                // 產生系統檔名（避免覆蓋）: UUID_vN.ext (放在 category 資料夾下)
                String uuid = UUID.randomUUID().toString();
                String systemFilename = generateSystemFilename(category, uuid, newVersion, extension);

                Path targetPath = fileStorageLocation.resolve(systemFilename);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

                FileEntity fileEntity = new FileEntity();
                fileEntity.setFilename(systemFilename);
                fileEntity.setOriginalFilename(displayOriginalName);
                fileEntity.setFileType(extension);
                fileEntity.setUploadTime(LocalDateTime.now());
                fileEntity.setUploadedBy("admin"); // TODO: 實際登入使用者
                fileEntity.setSizeInBytes(file.getSize());
                fileEntity.setStatus("pending");
                fileEntity.setCategory(category);
                fileEntity.setDescription(description);
                fileEntity.setProject(project);
                fileEntity.setVersion(newVersion == 0 ? 1 : newVersion); // 如果沒有 newVersion，仍可設 1

                fileRepository.save(fileEntity);

                // 操作紀錄
                String operator = "admin";
                String details = String.format("上傳了文件 '%s' 到類別 '%s'", displayOriginalName, category);
                operationHistoryService.recordHistory(projectId, operator, "UPLOAD_DOCUMENT", details);

                // 通知...
                NotificationSettings settings = notificationSettingsService.getSettings();
                if (settings.isDocumentUpdateNotice()) {
                    String notificationMessage = "新文件 " + displayOriginalName + " 被上傳到 '" + project.getName() + "'專案.";
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
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id, HttpServletRequest request) {
        try {
            Optional<FileEntity> optionalFile = fileRepository.findById(id);
            if (optionalFile.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            FileEntity fileEntity = optionalFile.get();
            Path filePath = fileStorageLocation.resolve(fileEntity.getFilename()).normalize();
            Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // 支援中文檔名
            String originalName = fileEntity.getOriginalFilename();
            String encodedFilename = java.net.URLEncoder.encode(originalName, "UTF-8").replaceAll("\\+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + originalName + "\"; filename*=UTF-8''" + encodedFilename)
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 下載分類 ZIP
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
                        // 使用原始檔名
                        String entryName = file.getOriginalFilename();
                        zos.putNextEntry(new java.util.zip.ZipEntry(entryName));
                        Files.copy(filePath, zos);
                        zos.closeEntry();
                    }
                }
            }

            Resource resource = new org.springframework.core.io.UrlResource(zipPath.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + zipFilename + "\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 下載所有檔案 ZIP (保留 category 資料夾)
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
            Set<String> entryNames = new HashSet<>();
            int counter = 1;

            for (FileEntity fileEntity : files) {
                Path filePath = fileStorageLocation.resolve(fileEntity.getFilename()).normalize();
                if (!Files.exists(filePath)) continue;

                // 使用 category + 原始檔名
                String entryName = fileEntity.getCategory() + "/" + fileEntity.getOriginalFilename();

                // 避免重複
                if (entryNames.contains(entryName)) {
                    entryName = counter++ + "_" + entryName;
                }
                entryNames.add(entryName);

                zos.putNextEntry(new ZipEntry(entryName));
                Files.copy(filePath, zos);
                zos.closeEntry();
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
        try {
            // 先確認檔案是否存在
            Optional<FileEntity> optional = fileRepository.findById(id);
            if (optional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "error", "找不到文件"));
            }
            FileEntity file = optional.get();
            Project project = file.getProject();

            // 刪除實體檔案
            Files.deleteIfExists(fileStorageLocation.resolve(file.getFilename()));

            // 直接刪除 DB 紀錄
            int deleted = fileRepository.deleteFileById(id); // 用自訂 @Modifying query
            if (deleted == 0) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("success", false, "error", "資料庫刪除失敗"));
            }
            
            // ===== 操作紀錄 =====
            if (project != null) {
                Long projectId = project.getId();
                String operator = "admin"; // TODO: 換成登入使用者
                String details = String.format(
                    "刪除了文件 '%s' (類別 '%s')，專案：'%s'",
                    file.getOriginalFilename(),
                    file.getCategory(),
                    project.getName()
                );
                operationHistoryService.recordHistory(projectId, operator, "DELETE_DOCUMENT", details);
            }

            // ===== 通知團隊 =====
            if (project != null) {
                NotificationSettings settings = notificationSettingsService.getSettings();
                if (settings.isDocumentUpdateNotice()) {
                    String message = String.format(
                        "文件 '%s' 已從專案 '%s' 中刪除",
                        file.getOriginalFilename(),
                        project.getName()
                    );

                    List<Long> userIds = project.getTeam().stream()
                            .map(pt -> pt.getUser().getId())
                            .toList();

                    notificationService.createNotification(userIds, -1L, "Project Update", message);
                }
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
                Path filePath = fileStorageLocation
                    .resolve(category)
                    .resolve(file.getFilename())
                    .normalize();
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
    private boolean isDirEmpty(final Path directory) throws IOException {
        try (DirectoryStream<Path> dirStream = Files.newDirectoryStream(directory)) {
            return !dirStream.iterator().hasNext();
        }
    }

    //for紀錄版本工具
    private String stripExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.substring(0, idx) : filename;
    }

    private String getExtension(String filename) {
        return filename != null && filename.contains(".")
                ? filename.substring(filename.lastIndexOf('.') + 1)
                : "";
    }

    /**
     * 取得 base name，不含已存在的 " vN" 後綴。
     * 例如 "report v2.pdf" -> "report"
     * 會檢查像 " name v1" / " name v12" 的情形
     */
    private String getBaseNameWithoutVersion(String filename) {
        String name = stripExtension(filename);
        // 用 regex 找 " v<digits>" 在尾巴
        return name.replaceFirst("\\s+v\\d+$", "");
    }

    /**
     * 找到目前同一專案 & 同一類別下，與 baseName 相同（考慮有 / 沒有 vN）的最大版本數。
     * 如果沒有相符則回傳 0。
     */
    private int findMaxExistingVersion(List<FileEntity> files, String baseName) {
        int max = 0;
        for (FileEntity f : files) {
            String orig = f.getOriginalFilename();
            if (orig == null) continue;
            String origNameNoExt = stripExtension(orig);
            // 如果完全相同（沒有任何 vN），視為版本 1 (但我們這邊為了簡化，視為 1 或 0，請參考說明)
            if (origNameNoExt.equals(baseName)) {
                // treat as version 1 candidate
                max = Math.max(max, 1);
                continue;
            }
            // 否則檢查是否符合 "baseName vN"
            String pattern = "^" + Pattern.quote(baseName) + "\\s+v(\\d+)$";
            Matcher m = Pattern.compile(pattern).matcher(origNameNoExt);
            if (m.find()) {
                try {
                    int v = Integer.parseInt(m.group(1));
                    max = Math.max(max, v);
                } catch (NumberFormatException ignored) {}
            }
        }
        return max;
    }

    /**
     * 產生系統存放的檔名（UUID + _vN + .ext）
     */
    private String generateSystemFilename(String category, String uuid, int version, String extension) {
        String verSuffix = version > 0 ? "_v" + version : "";
        String fname = uuid + verSuffix + (extension.isEmpty() ? "" : "." + extension);
        return category + "/" + fname;
    }

}
