package com.project.backend.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectDeadlineDTO {
    private Long id;
    private String name;
    private String status;
    private LocalDate endDate;

    public ProjectDeadlineDTO(Long id, String name, LocalDate endDate) {
        this.id = id;
        this.name = name;
        this.endDate = endDate;
    }
}
