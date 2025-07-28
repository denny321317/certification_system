package com.project.backend.controller;

import com.project.backend.dto.CertificationTemplateDTO;
import com.project.backend.dto.CertificationTemplateRequestDTO;
import com.project.backend.service.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    @Autowired
    private TemplateService templateService;

    @GetMapping
    public ResponseEntity<List<CertificationTemplateDTO>> getAllTemplates() {
        List<CertificationTemplateDTO> templates = templateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    @PostMapping
    public ResponseEntity<CertificationTemplateDTO> createTemplate(@RequestBody CertificationTemplateRequestDTO createDTO) {
        CertificationTemplateDTO createdTemplate = templateService.createTemplate(createDTO);
        return new ResponseEntity<>(createdTemplate, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CertificationTemplateDTO> updateTemplate(@PathVariable String id, @RequestBody CertificationTemplateRequestDTO updateDTO) {
        CertificationTemplateDTO updatedTemplate = templateService.updateTemplate(id, updateDTO);
        return ResponseEntity.ok(updatedTemplate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
} 