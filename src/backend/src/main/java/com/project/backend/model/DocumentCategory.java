package com.project.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "document_category")
public class DocumentCategory {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String icon;

    // getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
