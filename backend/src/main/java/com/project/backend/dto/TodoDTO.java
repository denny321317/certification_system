package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TodoDTO {
    private Long id;
    private String title;
    private String description;
    private String urgency;
    private String dueDate;
    private String category;
    private boolean completed;
    private String assigneeName;
}
