package com.project.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.backend.model.User;
import com.project.backend.repository.UserRepository;
import com.project.backend.dto.UserDTO;


@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/all")
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(u -> new UserDTO(u.getId(), u.getName(), u.getPosition()))
            .toList();
    }
} 
