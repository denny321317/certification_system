package com.project.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.backend.model.DocumentCategory;
import com.project.backend.repository.DocumentCategoryRepository;

@Service
public class DocumentCategoryService {

    @Autowired
    private DocumentCategoryRepository repository;

    public List<DocumentCategory> getAllCategories() {
        return repository.findAll();
    }

    public DocumentCategory addCategory(DocumentCategory category) {
        return repository.save(category);
    }

    public void deleteCategory(String id) {
        repository.deleteById(id);
    }
}
