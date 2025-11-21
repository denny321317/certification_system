package com.project.backend.service;

import com.project.backend.dto.CertificationTemplateDTO;
import com.project.backend.dto.CertificationTemplateRequestDTO;
import com.project.backend.dto.TemplateDocumentDTO;
import com.project.backend.dto.TemplateRequirementDTO;
import com.project.backend.model.CertificationTemplate;
import com.project.backend.model.TemplateDocument;
import com.project.backend.model.TemplateRequirement;
import com.project.backend.repository.CertificationTemplateRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TemplateService {

    @Autowired
    private CertificationTemplateRepository templateRepository;

    public List<CertificationTemplateDTO> getAllTemplates() {
        return templateRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
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
        return convertToDto(savedTemplate);
    }

    @Transactional
    public CertificationTemplateDTO updateTemplate(String id, CertificationTemplateRequestDTO updateDTO) {
        CertificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));

        template.setDisplayName(updateDTO.getDisplayName());
        template.setDescription(updateDTO.getDescription());

        template.getRequirements().clear();
        List<TemplateRequirement> newRequirements = updateDTO.getRequirements().stream()
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
        template.getRequirements().addAll(newRequirements);

        CertificationTemplate updatedTemplate = templateRepository.save(template);
        return convertToDto(updatedTemplate);
    }

    public void deleteTemplate(String id) {
        if (!templateRepository.existsById(id)) {
            throw new RuntimeException("Template not found with id: " + id);
        }
        templateRepository.deleteById(id);
    }

    public CertificationTemplateDTO getTemplateById(String id) {
        CertificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));
        return convertToDto(template);
    }

    private CertificationTemplateDTO convertToDto(CertificationTemplate template) {
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
                requirement.getText(),
                requirement.getDocuments().stream()
                        .map(this::convertDocumentToDto)
                        .collect(Collectors.toList())
        );
    }

    private TemplateDocumentDTO convertDocumentToDto(TemplateDocument document) {
        return new TemplateDocumentDTO(
                document.getName(),
                document.getDescription()
        );
    }
} 