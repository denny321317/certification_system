package com.project.backend.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String role;

    private String avatar;

    private String department;

    private String position;

    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @ManyToMany(mappedBy = "users")
    private List<Project> projects;
}
