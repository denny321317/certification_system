package com.project.backend.service;

import com.project.backend.dto.ShowProjectDTO;
import com.project.backend.dto.ProjectDetailDTO;
import com.project.backend.dto.ProjectRequirementStatusDTO;
import com.project.backend.dto.TeamMemberDTO;
import com.project.backend.dto.DocumentDTO;
import com.project.backend.dto.UserDTO;
import com.project.backend.dto.CertificationTemplateDTO;
import com.project.backend.model.*;
import com.project.backend.repository.*;
import com.project.backend.service.OperationHistoryService;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final OperationHistoryService operationHistoryService;
    private final ProjectTeamRepository projectTeamRepository;
    private final CertificationTemplateRepository certificationTemplateRepository;
    private final ProjectRequirementStatusRepository projectRequirementStatusRepository;


    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository,
                          OperationHistoryService operationHistoryService, ProjectTeamRepository projectTeamRepository,
                          CertificationTemplateRepository certificationTemplateRepository,
                          ProjectRequirementStatusRepository projectRequirementStatusRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.operationHistoryService = operationHistoryService;
        this.projectTeamRepository = projectTeamRepository;
        this.certificationTemplateRepository = certificationTemplateRepository;
        this.projectRequirementStatusRepository = projectRequirementStatusRepository;
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
        
        // Record history
        // TODO: Replace "admin" with actual logged-in user and get project name before deletion
        String operator = "admin";
        String details = String.format("刪除了專案 (ID: %d)", id);
        operationHistoryService.recordHistory(id, operator, "DELETE_PROJECT", details);
    }

    @Transactional
    public ShowProjectDTO updateProject(Long id, Project updatedProject) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project with id " + id + " does not exist."));

        // Logic to track changes
        StringBuilder changes = new StringBuilder();
        if (updatedProject.getName() != null && !project.getName().equals(updatedProject.getName())) {
            changes.append(String.format("名稱從 '%s' 變更為 '%s'. ", project.getName(), updatedProject.getName()));
        }
        if (updatedProject.getStatus() != null && !project.getStatus().equals(updatedProject.getStatus())) {
            changes.append(String.format("狀態從 '%s' 變更為 '%s'. ", project.getStatus(), updatedProject.getStatus()));
        }
        // Add more fields to track as needed...

        project.setName(updatedProject.getName());
        project.setStatus(updatedProject.getStatus());
        project.setCertType(updatedProject.getCertType());
        project.setStartDate(updatedProject.getStartDate());
        project.setEndDate(updatedProject.getEndDate());
        project.setInternalReviewDate(updatedProject.getInternalReviewDate());
        project.setExternalReviewDate(updatedProject.getExternalReviewDate());
        project.setManagerId(updatedProject.getManagerId());
        project.setAgency(updatedProject.getAgency());
        project.setDescription(updatedProject.getDescription());
        project.setProgress(updatedProject.getProgress()); // 直接更新進度
        // 根據 status 自動設定 progress/progressColor
        // updateProgressByStatus(project);
        // users, documents 不在此API更新
        projectRepository.save(project);

        // Record history if there are changes
        if (changes.length() > 0) {
            // TODO: Replace "admin" with actual logged-in user
            String operator = "admin";
            operationHistoryService.recordHistory(id, operator, "UPDATE_PROJECT", changes.toString());
        }

        return toShowProjectDTO(project);
    }

    //根據專案狀態自動設定進度與顏色
    public void updateProgressByStatus(Project project) {
        switch (project.getStatus()) {
            case "preparing":
                project.setProgress(10);
                project.setProgressColor("progress-preparing");
                break;
            case "internal-review":
                project.setProgress(40);
                project.setProgressColor("progress-internal");
                break;
            case "external-review":
                project.setProgress(70);
                project.setProgressColor("progress-external");
                break;
            case "completed":
                project.setProgress(100);
                project.setProgressColor("progress-completed");
                break;
            default:
                project.setProgress(0);
                project.setProgressColor("progress-default");
        }
    }

    public ShowProjectDTO toShowProjectDTO(Project project) {
        String managerName = "N/A";
        if (project.getManagerId() != null) {
            User manager = userRepository.findById(project.getManagerId()).orElse(null);
            if (manager != null) {
                managerName = manager.getName();
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
        List<ProjectTeam> teamMemberships = projectTeamRepository.findByProjectId(projectId);
        if (teamMemberships.isEmpty()) {
            return new ArrayList<>();
        }
        return teamMemberships.stream().map(pt -> {
            User user = pt.getUser();
            return new TeamMemberDTO(
                    user.getId(),
                    user.getName(),
                    pt.getRole(),
                    user.getPosition(),
                    user.getEmail(),
                    false, // isManager flag, can be enhanced later
                    pt.getPermission(),
                    pt.getDuties()
            );
        }).collect(Collectors.toList());

    }

    @Transactional
    public List<TeamMemberDTO> addTeamMember(Long projectId, Long userId, String role, String permission, java.util.List<String> duties) {
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
            pt.setPermission(permission);
            pt.setDuties(duties);
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
    

    @Transactional
    public List<TeamMemberDTO> updateMemberDuties(Long projectId, Long userId, List<String> duties) {
        ProjectTeam member = projectTeamRepository.findByProjectIdAndUserId(projectId, userId);
        if (member == null) {
            throw new IllegalArgumentException("Team member not found");
        }

        member.setDuties(duties);
        projectTeamRepository.save(member);

        return getTeamMembers(projectId);
    }


    @Transactional(readOnly = true)
    public ProjectDetailDTO getProjectDetailById(Long id) {
        Project project = projectRepository.findByIdWithRequirementStatuses(id)
                .orElseThrow(() -> new IllegalArgumentException("Project with id " + id + " does not exist."));
        return buildProjectDetailDTO(project);
    }

    private ProjectDetailDTO buildProjectDetailDTO(Project project) {
        List<TeamMemberDTO> team = getTeamMembers(project.getId());

        List<DocumentDTO> documents = project.getDocuments() != null ?
                project.getDocuments().stream().map(doc -> new DocumentDTO(
                        doc.getId(),
                        doc.getOriginalFilename(),
                        doc.getFilename(),
                        doc.getCategory(),
                        doc.getFileType(),
                        doc.getUploadedBy(),
                        doc.getUploadTime() != null ? doc.getUploadTime().toLocalDate().toString() : null,
                        doc.getDescription()
                )).collect(Collectors.toList()) : new ArrayList<>();

        List<ProjectRequirementStatusDTO> requirementStatuses = project.getRequirementStatuses().stream()
                .map(status -> {
                    List<DocumentDTO> documentDTOs = status.getTemplateRequirement().getDocuments().stream()
                            .map(doc -> new DocumentDTO(
                                    doc.getId(),
                                    doc.getName(),
                                    null, null, null, null, null, null
                            )).collect(Collectors.toList());

                    return new ProjectRequirementStatusDTO(
                            status.getId(),
                            status.getTemplateRequirement().getId(),
                            status.getTemplateRequirement().getText(),
                            status.isCompleted(),
                            documentDTOs
                    );
                })
                .collect(Collectors.toList());

        String progressMode = project.getProgressCalculationMode() != null
                ? project.getProgressCalculationMode().name()
                : ProgressCalculationMode.MANUAL.name();

        CertificationTemplateDTO templateDTO = null;
        if (project.getCertificationTemplate() != null) {
            templateDTO = new CertificationTemplateDTO(
                    project.getCertificationTemplate().getId(),
                    project.getCertificationTemplate().getDisplayName(),
                    project.getCertificationTemplate().getDescription(),
                    null // Requirements not needed for this view
            );
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
                documents,
                progressMode,
                requirementStatuses,
                templateDTO
        );
    }

    @Transactional
    public void applyTemplateToProject(Long projectId, String templateId) {
        Project project = projectRepository.findByIdWithRequirementStatuses(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));
        CertificationTemplate template = certificationTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found with id: " + templateId));

        // 關聯專案與範本
        project.setCertificationTemplate(template);

        // 先將進度歸零
        project.setProgress(0);

        // Rely on orphanRemoval=true to safely clear existing statuses
        project.getRequirementStatuses().clear();


        // 根據新範本的需求，建立新的狀態紀錄
        for (TemplateRequirement requirement : template.getRequirements()) {
            ProjectRequirementStatus status = ProjectRequirementStatus.builder()
                    .project(project)
                    .templateRequirement(requirement)
                    .isCompleted(false)
                    .build();
            project.getRequirementStatuses().add(status);
        }

        projectRepository.save(project);

        // Recalculate progress if in automatic mode
        calculateProjectProgress(project);
    }

    @Transactional
    public ProjectDetailDTO updateRequirementStatus(Long projectId, Long requirementId, boolean isCompleted) {
        ProjectRequirementStatus status = projectRequirementStatusRepository.findById(requirementId)
                .orElseThrow(() -> new IllegalArgumentException("Requirement status not found with id: " + requirementId));

        if (!status.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Requirement status does not belong to the specified project.");
        }

        status.setCompleted(isCompleted);
        projectRequirementStatusRepository.save(status);

        Project project = status.getProject();
        if (project.getProgressCalculationMode() == ProgressCalculationMode.AUTOMATIC) {
            calculateProjectProgress(project);
        }
        
        // Return the updated project details using the helper
        return buildProjectDetailDTO(project);
    }

    @Transactional
    public void setProgressCalculationMode(Long projectId, ProgressCalculationMode mode) {
        Project project = projectRepository.findByIdWithRequirementStatuses(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        project.setProgressCalculationMode(mode);

        if (mode == ProgressCalculationMode.AUTOMATIC) {
            calculateProjectProgress(project);
        }

        projectRepository.save(project);
    }

    private void calculateProjectProgress(Project project) {
        if (project.getProgressCalculationMode() == ProgressCalculationMode.AUTOMATIC) {
            List<ProjectRequirementStatus> statuses = project.getRequirementStatuses();

            if (statuses == null || statuses.isEmpty()) {
                project.setProgress(0);
            } else {
                long completedCount = statuses.stream().filter(ProjectRequirementStatus::isCompleted).count();
                int progress = (int) Math.round(((double) completedCount / statuses.size()) * 100);
                project.setProgress(progress);
            }
            projectRepository.save(project);
        }
    }
}
