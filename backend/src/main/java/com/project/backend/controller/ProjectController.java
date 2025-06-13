package com.project.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.project.backend.dto.ProjectDetailDTO;
import com.project.backend.dto.TeamMemberDTO;
import com.project.backend.model.Project;
import com.project.backend.repository.ProjectRepository;
import com.project.backend.service.AuthService;
import com.project.backend.service.ProjectService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping("/CreateProject")
    public Project createProject(@RequestBody Project project) {
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
        return projectService.getProjectDetailById(id);
    }

    @GetMapping("/{projectId}/team")
    public List<TeamMemberDTO> getTeamMembers(@PathVariable Long projectId) {
        return projectService.getTeamMembers(projectId);
    }

    @PostMapping("/{projectId}/add-member")
    public List<TeamMemberDTO> addTeamMember(@PathVariable Long projectId, @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String role = body.get("role") != null ? body.get("role").toString() : "";
        return projectService.addTeamMember(projectId, userId, role);
    }

    @PostMapping("/{projectId}/remove-member")
    public List<TeamMemberDTO> removeTeamMember(@PathVariable Long projectId, @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        return projectService.removeTeamMember(projectId, userId);
    }
}
