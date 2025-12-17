package com.project.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "todos")
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;
    @Column
    private String urgency;

    @Column
    private String dueDate;  // 用 String 儲存 yyyy/MM/dd

    @Column
    private String category;
    
    @Column(nullable = false)
    private boolean completed = false;
    
    @Column
    private String assigneeName;
}
