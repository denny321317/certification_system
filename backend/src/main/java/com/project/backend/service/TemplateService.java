package com.project.backend.service;

import com.project.backend.dto.CertificationTemplateDTO;
import com.project.backend.dto.CertificationTemplateRequestDTO;
import com.project.backend.dto.TemplateDocumentDTO;
import com.project.backend.dto.TemplateRequirementDTO;
import com.project.backend.model.CertificationTemplate;
import com.project.backend.model.TemplateDocument;
import com.project.backend.model.TemplateRequirement;
import com.project.backend.repository.CertificationTemplateRepository;
import com.project.backend.repository.ProjectRequirementStatusRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TemplateService {

    @Autowired
    private CertificationTemplateRepository templateRepository;

    @Autowired
    private ProjectRequirementStatusRepository projectRequirementStatusRepository;

    public List<CertificationTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    @Transactional
    public CertificationTemplateDTO createTemplate(CertificationTemplateRequestDTO createDTO) {
        CertificationTemplate template = new CertificationTemplate();
        template.setId(createDTO.getId());
        template.setDisplayName(createDTO.getDisplayName() != null ? createDTO.getDisplayName() : createDTO.getId());
        template.setDescription(createDTO.getDescription());

        List<TemplateRequirement> requirements = createDTO.getRequirements().stream()
                .map(reqDto -> {
                    TemplateRequirement req = new TemplateRequirement();
                    req.setText(reqDto.getText());
                    req.setTemplate(template);
                    List<TemplateDocument> documents = reqDto.getDocuments().stream()
                            .map(docDto -> {
                                TemplateDocument doc = new TemplateDocument();
                                doc.setName(docDto.getName());
                                doc.setDescription(docDto.getDescription());
                                doc.setRequirement(req);
                                return doc;
                            }).collect(Collectors.toList());
                    req.setDocuments(documents);
                    return req;
                }).collect(Collectors.toList());

        template.setRequirements(requirements);
        CertificationTemplate savedTemplate = templateRepository.save(template);
        return convertTemplateToDto(savedTemplate);
    }

    @Transactional
    public CertificationTemplateDTO updateTemplate(String id, CertificationTemplateRequestDTO updateDTO) {
        CertificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));

        template.setDisplayName(updateDTO.getDisplayName());
        template.setDescription(updateDTO.getDescription());

        Map<Long, TemplateRequirement> existingRequirements = template.getRequirements().stream()
                .collect(Collectors.toMap(TemplateRequirement::getId, Function.identity()));

        List<TemplateRequirement> updatedRequirements = updateDTO.getRequirements().stream().map(reqDto -> {
            TemplateRequirement req = existingRequirements.getOrDefault(reqDto.getId(), new TemplateRequirement());
            if (req.getId() != null) {
                existingRequirements.remove(req.getId());
            }

            req.setText(reqDto.getText());
            req.setTemplate(template);

            Map<Long, TemplateDocument> existingDocuments = req.getDocuments() != null ?
                    req.getDocuments().stream().collect(Collectors.toMap(TemplateDocument::getId, Function.identity())) :
                    Map.of();

            List<TemplateDocument> updatedDocuments = reqDto.getDocuments().stream().map(docDto -> {
                TemplateDocument doc = existingDocuments.getOrDefault(docDto.getId(), new TemplateDocument());
                if (doc.getId() != null) {
                    existingDocuments.remove(doc.getId());
                }
                doc.setName(docDto.getName());
                doc.setDescription(docDto.getDescription());
                doc.setRequirement(req);
                return doc;
            }).collect(Collectors.toList());

            req.getDocuments().clear();
            req.getDocuments().addAll(updatedDocuments);

            // Remove old documents
            req.getDocuments().removeAll(existingDocuments.values());

            return req;
        }).collect(Collectors.toList());

        for (TemplateRequirement toBeRemoved : existingRequirements.values()) {
            if (projectRequirementStatusRepository.existsByTemplateRequirementId(toBeRemoved.getId())) {
                throw new RuntimeException("Cannot delete requirement that is in use by a project: " + toBeRemoved.getText());
            }
        }

        template.getRequirements().clear();
        template.getRequirements().addAll(updatedRequirements);

        CertificationTemplate updatedTemplate = templateRepository.save(template);
        return convertTemplateToDto(updatedTemplate);
    }

    public void deleteTemplate(String id) {
        if (!templateRepository.existsById(id)) {
            throw new RuntimeException("Template not found with id: " + id);
        }
        templateRepository.deleteById(id);
    }

    private CertificationTemplateDTO convertTemplateToDto(CertificationTemplate template) {
        return new CertificationTemplateDTO(
                template.getId(),
                template.getDisplayName(),
                template.getDescription(),
                template.getRequirements().stream()
                        .map(this::convertRequirementToDto)
                        .collect(Collectors.toList())
        );
    }

    private TemplateRequirementDTO convertRequirementToDto(TemplateRequirement requirement) {
        return new TemplateRequirementDTO(
                requirement.getId(),
                requirement.getText(),
                requirement.getDocuments().stream()
                        .map(this::convertDocumentToDto)
                        .collect(Collectors.toList())
        );
    }

    private TemplateDocumentDTO convertDocumentToDto(TemplateDocument document) {
        return new TemplateDocumentDTO(
                document.getId(),
                document.getName(),
                document.getDescription()
        );
    }
} 