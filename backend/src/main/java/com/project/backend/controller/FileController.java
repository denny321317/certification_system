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
                String baseName = getBaseNameWithoutVersion(originalFilename); // Base name 不含 _vN 和副檔名

                // 取得同一 project + category 下的所有檔案來比對
                List<FileEntity> sameCategoryFiles = fileRepository.findByCategoryAndProjectId(category, projectId);

                // 尋找同 BaseName + Extension 的最大版本 (此方法已假設配合 _vN 格式調整)
                int maxVersion = findMaxExistingVersion(sameCategoryFiles, baseName, extension);
                // 計算新的版本號：如果找到現有版本，則 +1；否則從 1 開始
                int actualVersion = maxVersion + 1;
                
                // 決定要存入 DB 的 originalFilename（顯示名稱）
                String displayOriginalName;
                String extPart = extension.isEmpty() ? "" : "." + extension;
                
                // 【已修正】統一使用 "_vN" 格式，包括 V1 (例如: abc_v1.xlsx)
                displayOriginalName = baseName + "_v" + actualVersion + extPart;

                // 產生系統檔名（避免覆蓋）: UUID_vN.ext (放在 category 資料夾下)
                String uuid = UUID.randomUUID().toString();
                // generateSystemFilename 必須使用 actualVersion
                String systemFilename = generateSystemFilename(category, uuid, actualVersion, extension); 

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
                fileEntity.setVersion(actualVersion); // 儲存 actualVersion

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

    // 查詢專案文件 (只列出最新版本)
    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> listDocumentsByProject(@PathVariable Long projectId) {
        // 1. 取得專案所有文件
        List<FileEntity> allFiles = fileRepository.findByProjectId(projectId);

        // 2. 按 BaseName + Extension 分組
        Map<String, List<FileEntity>> groupedFiles = groupFilesByBaseName(allFiles); // 使用修正後的 groupFilesByBaseName

        // 3. 提取每個組的最新版本
        List<FileEntity> latestVersions = groupedFiles.values().stream()
                .map(this::getLatestVersion)
                .filter(Objects::nonNull)
                .toList();

        // 4. 轉換為 Response 格式
        List<Map<String, Object>> responseList = latestVersions.stream().map(file -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", file.getId());
            map.put("name", file.getOriginalFilename());
            map.put("category", file.getCategory());
            map.put("type", file.getFileType());
            map.put("uploadedBy", file.getUploadedBy());
            map.put("uploadDate", file.getUploadTime().toLocalDate().toString());
            map.put("description", file.getDescription());
            map.put("status", file.getStatus());
            map.put("version", file.getVersion()); // 增加版本號
            return map;
        }).toList();

        return ResponseEntity.ok(responseList);
    }
        
    // 返回同名檔案的所有版本文件
    @GetMapping("/versions/{fileId}")
    public ResponseEntity<?> listAllVersionsOfFile(@PathVariable Long fileId) {
        // 1. 找到指定的檔案作為基準
        Optional<FileEntity> optionalBaseFile = fileRepository.findById(fileId);
        if (optionalBaseFile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "找不到該文件"));
        }
        FileEntity baseFile = optionalBaseFile.get();
        
        // 檢查 project 關聯是否存在
        if (baseFile.getProject() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "文件未與專案關聯"));
        }
        
        Long projectId = baseFile.getProject().getId();
        
        // 2. 取得該檔案的 BaseName (不含版本號和副檔名) - 此處依賴修正後的 getBaseNameWithoutVersion
        String baseName = getBaseNameWithoutVersion(baseFile.getOriginalFilename());
        
        // 2.1 取得該檔案的副檔名 (這是關鍵，要確保類型也相同)
        String baseExtension = baseFile.getFileType(); 
        
        // 3. 取得專案下所有文件
        List<FileEntity> allFiles = fileRepository.findByProjectId(projectId);
        
        // 4. 過濾出 BaseName 和 副檔名 都相同的版本
        List<FileEntity> allVersions = allFiles.stream()
                .filter(file -> 
                    // 條件一：BaseName 相同 (使用修正後的 getBaseNameWithoutVersion)
                    baseName.equals(getBaseNameWithoutVersion(file.getOriginalFilename())) &&
                    // 條件二：副檔名相同
                    baseExtension.equalsIgnoreCase(file.getFileType())
                )
                .sorted(Comparator.comparing(FileEntity::getVersion, Comparator.nullsLast(Comparator.reverseOrder()))) // 按版本降序
                .toList();
        
        // 5. 轉換為 Response 格式
        List<Map<String, Object>> responseList = allVersions.stream().map(file -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", file.getId());
            map.put("name", file.getOriginalFilename());
            map.put("category", file.getCategory());
            map.put("type", file.getFileType());
            map.put("uploadedBy", file.getUploadedBy());
            map.put("uploadDate", file.getUploadTime().toLocalDate().toString());
            map.put("description", file.getDescription());
            map.put("status", file.getStatus());
            map.put("version", file.getVersion());
            return map;
        }).toList();
        
        // 回傳 baseName 最好包含副檔名，以明確區分版本系列
        String displayName = baseName + "." + baseExtension;
        
        return ResponseEntity.ok(Map.of(
            "baseName", displayName,
            "allVersions", responseList
        ));
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
     * 取得 base name，不含已存在的 "_vN" 後綴。
     * 例如 "report_v2.pdf" -> "report"
     */
    private String getBaseNameWithoutVersion(String filename) {
        String name = stripExtension(filename);
        // 用 regex 找 "_v<digits>" 在尾巴
        return name.replaceFirst("_v\\d+$", ""); 
    }

    /**
     * 找到目前同一專案 & 同一類別下，與 baseName + extension 相同（考慮有 _vN）的最大版本數。
    * 僅依賴 _vN 格式來計算版本。
    */
    private int findMaxExistingVersion(List<FileEntity> files, String baseName, String extension) {
        int max = 0;
        String targetExt = extension.isEmpty() ? "" : "." + extension; // 處理副檔名有無的情況
        
        for (FileEntity f : files) {
            String orig = f.getOriginalFilename();
            if (orig == null) continue;
            
            // 1. 檢查副檔名是否相符
            String fileExt = getExtension(orig); // 取得檔案的副檔名
            if (!fileExt.equalsIgnoreCase(extension)) {
                continue; // 副檔名不符，跳過
            }
            
            String origNameNoExt = stripExtension(orig);
            
            // 2. 檢查是否符合 "baseName_vN"
            // 這裡的 pattern 仍然只匹配 baseName，但我們已經在前面過濾了 extension
            String pattern = "^" + Pattern.quote(baseName) + "_v(\\d+)$"; 
            Matcher m = Pattern.compile(pattern).matcher(origNameNoExt);
            
            if (m.find()) {
                try {
                    // 這裡也可以直接使用 f.getVersion()，前提是 DB 儲存的版本是正確的
                    int v = Integer.parseInt(m.group(1)); 
                    max = Math.max(max, v);
                } catch (NumberFormatException ignored) {}
            } 
            // 另外檢查 V1 的情況：如果原始檔名剛好就是 baseName + ext（且它被 DB 存成了 V1）
            // 由於您的新邏輯已經強制 V1 也是 _v1，所以只需要檢查 _vN 即可。
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

    //輔助方法: 將文件列表按 BaseName + Extension 分組
    private Map<String, List<FileEntity>> groupFilesByBaseName(List<FileEntity> files) {
        Map<String, List<FileEntity>> groupedFiles = new HashMap<>();

        for (FileEntity file : files) {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) continue;

            // 1. 取得不含 "_vN" 的 BaseName (使用修正後的 getBaseNameWithoutVersion)
            String baseNameNoExt = getBaseNameWithoutVersion(originalFilename);
            
            // 2. 取得副檔名
            String extension = file.getFileType(); // 使用 file.getFileType() 比從檔名解析更安全
            
            // 3. 組合 Key: baseNameNoExt + "." + extension
            String groupingKey = baseNameNoExt + "." + extension;

            if (baseNameNoExt == null) continue; 
            
            groupedFiles.computeIfAbsent(groupingKey, k -> new ArrayList<>()).add(file);
        }
        
        // 確保每個組內的文件都按版本號降序排列 
        groupedFiles.values().forEach(list -> 
            list.sort(Comparator.comparing(FileEntity::getVersion, Comparator.nullsLast(Comparator.reverseOrder())))
        );
        
        return groupedFiles;
    }
    
    // 輔助方法: 提取最新版本
    private FileEntity getLatestVersion(List<FileEntity> files) {
        if (files == null || files.isEmpty()) return null;
        // 尋找版本號最大的文件
        return files.stream()
                .max(Comparator.comparing(FileEntity::getVersion, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(null);
    }

}
