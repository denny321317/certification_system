package com.project.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import com.project.backend.model.DocumentCategory;
import com.project.backend.service.DocumentCategoryService;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*") // 或指定前端網址
public class DocumentCategoryController {

    @Autowired
    private DocumentCategoryService service;

    @GetMapping
    public List<DocumentCategory> getAllCategories() {
        return service.getAllCategories();
    }

    @PostMapping
    public ResponseEntity<DocumentCategory> addCategory(@RequestBody DocumentCategory category) {
        if (service.getAllCategories().stream().anyMatch(c -> c.getId().equals(category.getId()))) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.ok(service.addCategory(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        service.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
