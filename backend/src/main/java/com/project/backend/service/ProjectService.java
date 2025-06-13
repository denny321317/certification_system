package com.project.backend.service;

import com.project.backend.dto.ShowProjectDTO;
import com.project.backend.model.Project;
import com.project.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<ShowProjectDTO> getAllProjects() {
        List<Project> projects = projectRepository.findAll();

        return projects.stream().map(project -> new ShowProjectDTO(
                project.getId(),
                project.getName(),
                project.getStatus(),
                project.getStartDate() != null ? project.getStartDate().toString() : null,
                project.getEndDate() != null ? project.getEndDate().toString() : null,
                project.getInternalReviewDate() != null ? project.getInternalReviewDate().toString() : null,
                project.getExternalReviewDate() != null ? project.getExternalReviewDate().toString() : null,
                project.getManager(),
                project.getAgency(),
                project.getProgressColor(),
                project.getProgress()
        )).collect(Collectors.toList());
    }

    @Transactional
    public void deleteProjectById(Integer id) {
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("Project with id " + id + " does not exist.");
        }
        projectRepository.deleteById(id);
    }
}
