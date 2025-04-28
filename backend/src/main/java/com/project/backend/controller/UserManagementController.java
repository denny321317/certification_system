package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.*;

import com.project.backend.service.UserManagementService;
import com.project.backend.model.User;

import java.util.List;

@RestController
@RequestMapping("/api/user-management")
@CrossOrigin(origins = "http://localhost:3000")
public class UserManagementController {
    
    @Autowired
    private UserManagementService userManagementService;

    // TODO: finish the controller mappings

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(){
        List<User> users = userManagementService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{roleName}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String roleName){
        List<User> users = userManagementService.getUsersByRole(roleName);
        return ResponseEntity.ok(users);
    }

}
