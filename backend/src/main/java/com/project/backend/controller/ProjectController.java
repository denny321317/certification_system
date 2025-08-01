package com.project.backend.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.project.backend.dto.ShowProjectDTO;
import com.project.backend.dto.ExportSettingsDTO;
import com.project.backend.dto.ProjectDetailDTO;
import com.project.backend.dto.ReviewDTO;
import com.project.backend.dto.TeamMemberDTO;
import com.project.backend.model.Project;
import com.project.backend.repository.ProjectRepository;
import com.project.backend.service.AuthService;
import com.project.backend.service.ProjectService;
import com.project.backend.service.ReviewService;
import com.project.backend.utils.ProjectExcelGenerator;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectController.class);

    @Autowired
    private ProjectRepository projectRepository;

    private final ProjectService projectService;
    private final ReviewService reviewService;

    @Autowired
    public ProjectController(ProjectService projectService, ReviewService reviewService) {
        this.projectService = projectService;
        this.reviewService = reviewService;
    }

    @PostMapping("/CreateProject")
    public Project createProject(@RequestBody Project project) {
        projectService.updateProgressByStatus(project);
        return projectRepository.save(project);
    }

    @GetMapping("/GetAllProject")
    public List<ShowProjectDTO> getAllProjects() {
        return projectService.getAllProjects();
    }

    @DeleteMapping("/DeleteProject/{id}")
    public void deleteProject(@PathVariable Long id) {
        projectService.deleteProjectById(id);
    }

    @PutMapping("/UpdateProject/{id}")
    public ShowProjectDTO updateProject(@PathVariable Long id, @RequestBody Project project) {
        return projectService.updateProject(id, project);
    }

    @GetMapping("/{id}")
    public ProjectDetailDTO getProjectDetail(@PathVariable Long id) {
        logger.info("Attempting to fetch project detail for ID: {}", id);
        try {
            ProjectDetailDTO projectDetail = projectService.getProjectDetailById(id);
            logger.info("Successfully fetched project detail for ID: {}", id);
            return projectDetail;
        } catch (Exception e) {
            logger.error("Error fetching project detail for ID: {}. Error: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{projectId}/team")
    public List<TeamMemberDTO> getTeamMembers(@PathVariable Long projectId) {
        return projectService.getTeamMembers(projectId);
    }

    @PostMapping("/{projectId}/add-member")
    public List<TeamMemberDTO> addTeamMember(@PathVariable Long projectId, @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String role = body.get("role") != null ? body.get("role").toString() : "";
        String permission = body.get("permission") != null ? body.get("permission").toString() : "view";
        java.util.List<String> duties = (java.util.List<String>) body.get("duties");
        return projectService.addTeamMember(projectId, userId, role, permission, duties);
    }

    @PostMapping("/{projectId}/remove-member")
    public List<TeamMemberDTO> removeTeamMember(@PathVariable Long projectId, @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        return projectService.removeTeamMember(projectId, userId);
    }

    @PostMapping("/{projectId}/update-member")
    public List<TeamMemberDTO> updateMemberDuties(@PathVariable Long projectId, @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        List<String> duties = (List<String>) body.get("duties");
        return projectService.updateMemberDuties(projectId, userId, duties);
    }
    @PostMapping("/{projectId}/export")
    public ResponseEntity<byte[]> exportProjectExcel(@RequestBody ExportSettingsDTO request) {
        try {
            ProjectDetailDTO project = projectService.getProjectDetailById(request.getProjectId());
            List<ReviewDTO> reviews = reviewService.getReviewsByProjectId(request.getProjectId());

            ExportSettingsDTO settings = new ExportSettingsDTO();
            settings.setIncludeBasicInfo(request.isIncludeBasicInfo());
            settings.setIncludeTeamInfo(request.isIncludeTeamInfo());
            settings.setIncludeDocuments(request.isIncludeDocuments());
            settings.setIncludeReviews(request.isIncludeReviews());
            settings.setNotes(request.getNotes());
            // 其他欄位如果有也一起設定，這裡先留空

            byte[] excel = ProjectExcelGenerator.generateProjectExcel(project, reviews, settings);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=project.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(excel);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    
}
