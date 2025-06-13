package com.project.backend.service;

import com.project.backend.dto.ShowProjectDTO;
import com.project.backend.dto.ProjectDetailDTO;
import com.project.backend.dto.TeamMemberDTO;
import com.project.backend.dto.DocumentDTO;
import com.project.backend.dto.UserDTO;
import com.project.backend.model.Project;
import com.project.backend.model.FileEntity;
import com.project.backend.model.User;
import com.project.backend.model.ProjectTeam;
import com.project.backend.repository.ProjectRepository;
import com.project.backend.repository.UserRepository;
import com.project.backend.repository.ProjectTeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectTeamRepository projectTeamRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, ProjectTeamRepository projectTeamRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.projectTeamRepository = projectTeamRepository;
    }

    @Transactional(readOnly = true)
    public List<ShowProjectDTO> getAllProjects() {
        List<Project> projects = projectRepository.findAll();

        return projects.stream().map(this::toShowProjectDTO).collect(Collectors.toList());
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
        project.setManagerId(updatedProject.getManagerId());
        project.setAgency(updatedProject.getAgency());
        project.setProgress(updatedProject.getProgress());
        project.setProgressColor(updatedProject.getProgressColor());
        project.setDescription(updatedProject.getDescription());
        // users, documents 不在此API更新
        projectRepository.save(project);
        return toShowProjectDTO(project);
    }

    public ShowProjectDTO toShowProjectDTO(Project project) {
        String managerName = null;
        if (project.getManagerId() != null) {
            var userOpt = userRepository.findById(project.getManagerId());
            if (userOpt.isPresent()) {
                managerName = userOpt.get().getName();
            }
        }
        return new ShowProjectDTO(
            project.getId(),
            project.getName(),
            project.getStatus(),
            project.getStartDate() != null ? project.getStartDate().toString() : null,
            project.getEndDate() != null ? project.getEndDate().toString() : null,
            project.getInternalReviewDate() != null ? project.getInternalReviewDate().toString() : null,
            project.getExternalReviewDate() != null ? project.getExternalReviewDate().toString() : null,
            managerName,
            project.getAgency(),
            project.getProgressColor(),
            project.getProgress()
        );
    }

    @Transactional(readOnly = true)
    public List<TeamMemberDTO> getTeamMembers(Long projectId) {
        List<ProjectTeam> team = projectTeamRepository.findByProjectId(projectId);
        Project project = projectRepository.findById(projectId).orElse(null);
        Long managerId = project != null ? project.getManagerId() : null;
        return team.stream().map(pt -> new TeamMemberDTO(
                pt.getUser().getId(),
                pt.getUser().getName(),
                pt.getRole(),
                pt.getUser().getEmail(),
                managerId != null && pt.getUser().getId().equals(managerId)
        )).collect(Collectors.toList());
    }

    @Transactional
    public List<TeamMemberDTO> addTeamMember(Long projectId, Long userId, String role) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ProjectTeam existing = projectTeamRepository.findByProjectIdAndUserId(projectId, userId);
        if (existing == null) {
            ProjectTeam pt = new ProjectTeam();
            pt.setProject(project);
            pt.setUser(user);
            pt.setRole(role);
            projectTeamRepository.save(pt);
        }
        return getTeamMembers(projectId);
    }

    @Transactional
    public List<TeamMemberDTO> removeTeamMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (project.getManagerId() != null && project.getManagerId().equals(userId)) {
            throw new IllegalArgumentException("不能移除專案負責人");
        }
        projectTeamRepository.deleteByProjectIdAndUserId(projectId, userId);
        return getTeamMembers(projectId);
    }

    @Transactional(readOnly = true)
    public ProjectDetailDTO getProjectDetailById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project with id " + id + " does not exist."));

        // 組裝團隊成員
        List<TeamMemberDTO> team = getTeamMembers(id);

        // 組裝文件
        List<DocumentDTO> documents = null;
        if (project.getDocuments() != null) {
            documents = project.getDocuments().stream().map(doc -> new DocumentDTO(
                    doc.getId(),
                    doc.getOriginalFilename(),
                    doc.getFilename(),
                    doc.getCategory(),
                    doc.getFileType(),
                    doc.getUploadedBy(),
                    doc.getUploadTime() != null ? doc.getUploadTime().toLocalDate().toString() : null,
                    doc.getDescription()
            )).collect(Collectors.toList());
        }

        return new ProjectDetailDTO(
                project.getId(),
                project.getName(),
                project.getStatus(),
                project.getCertType(),
                project.getStartDate() != null ? project.getStartDate().toString() : null,
                project.getEndDate() != null ? project.getEndDate().toString() : null,
                project.getInternalReviewDate() != null ? project.getInternalReviewDate().toString() : null,
                project.getExternalReviewDate() != null ? project.getExternalReviewDate().toString() : null,
                project.getManagerId() != null ? String.valueOf(project.getManagerId()) : null,
                project.getAgency(),
                project.getProgress(),
                project.getProgressColor(),
                project.getDescription(),
                team,
                documents
        );
    }
}
