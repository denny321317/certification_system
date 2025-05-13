package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.*;

import com.project.backend.service.UserManagementService;
import com.project.backend.model.User;
import com.project.backend.dto.UserStatsDTO;
import com.project.backend.model.Role;
import com.project.backend.dto.UserCreationDTO;

import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/user-management")
@CrossOrigin(origins = "http://localhost:3000")
public class UserManagementController {
    
    @Autowired
    private UserManagementService userManagementService;

    // TODO: function for creating new Users

    @GetMapping("/allUsers")
    public ResponseEntity<List<User>> getAllUsers(){
        List<User> users = userManagementService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    

    @GetMapping("/role/{roleName}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String roleName){
        List<User> users = userManagementService.getUsersByRole(roleName);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getUserStats(){
        long totalUsers = userManagementService.getTotalUserCount();
        Map<String, Long> usersByRole = userManagementService.getUserCountsByRole();
        long onlineUsers = userManagementService.getOnlineUserCount();

        UserStatsDTO stats = new UserStatsDTO(totalUsers, usersByRole, onlineUsers);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/role/{roleName}/authorizations")
    public ResponseEntity<?> updateRoleAuthorizations(@PathVariable String roleName, @RequestBody boolean[] authorizations) {
        try{
            Role updatedRole = userManagementService.updateRoleAuthorizations(roleName, authorizations);
            return ResponseEntity.ok(updatedRole);
        }
        catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occured");
        }
    }



    /**
     * This API takes in json reqeust body
     * @param userDTO the user data to create, parsed from the JSON request body
     */
    @PostMapping("/createUser")
    public ResponseEntity<?> createUser(@RequestBody UserCreationDTO userDTO){
        try {
            User newUser = userManagementService.createUser(userDTO);
            return new ResponseEntity<>(newUser, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Log the exception e for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred while creating the user.");
        }
    }


    

}
