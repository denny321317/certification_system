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
    public void deleteProjectById(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("Project with id " + id + " does not exist.");
        }
        projectRepository.deleteById(id);
    }

    @Transactional
    public ShowProjectDTO updateProject(Long id, Project updatedProject) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project with id " + id + " does not exist."));

        project.setName(updatedProject.getName());
        project.setStatus(updatedProject.getStatus());
        project.setCertType(updatedProject.getCertType());
        project.setStartDate(updatedProject.getStartDate());
        project.setEndDate(updatedProject.getEndDate());
        project.setInternalReviewDate(updatedProject.getInternalReviewDate());
        project.setExternalReviewDate(updatedProject.getExternalReviewDate());
        project.setManager(updatedProject.getManager());
        project.setAgency(updatedProject.getAgency());
        project.setProgress(updatedProject.getProgress());
        project.setProgressColor(updatedProject.getProgressColor());
        project.setDescription(updatedProject.getDescription());
        // users, documents 不在此API更新
        projectRepository.save(project);
        return toShowProjectDTO(project);
    }

    public ShowProjectDTO toShowProjectDTO(Project project) {
        return new ShowProjectDTO(
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
        );
    }
}
