package com.project.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.project.backend.dto.ShowProjectDTO;
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

    @Autowired
    private ProjectService projectService;

    @PostMapping("/CreateProject")
    public Project createProject(@RequestBody Project project) {
        return projectRepository.save(project);
    }

    @GetMapping("/GetAllProject")
    public List<ShowProjectDTO> getAllProjects() {
        return projectService.getAllProjects();
    }

    @DeleteMapping("/DeleteProject/{id}")
    public void deleteProject(@PathVariable Integer id) {
        projectService.deleteProjectById(id);
    }
}
