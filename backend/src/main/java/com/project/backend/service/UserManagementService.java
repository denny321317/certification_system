package com.project.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import com.project.backend.model.User;
import com.project.backend.model.Role;
import com.project.backend.repository.UserRepository;
import com.project.backend.repository.RoleRepository;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserManagementService(UserRepository userRepository, RoleRepository roleRepository){
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public User createUser(String name, String email, String roleName, String deparment){
        Role role = roleRepository.findByName(roleName);
        if (role == null){
            throw new IllegalArgumentException("Role not found: " + roleName);
        }

        User user = new User(roleName, role, email, deparment);
        return userRepository.save(user);
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(String roleName){
        Role role = roleRepository.findByName(roleName);
        if (role == null){
            throw new IllegalArgumentException("Role not found: " + roleName);
        }
        return userRepository.findByRole(role);
    }

    public void setRoleAuthorizations(Role role, boolean[] authorizations){
        role.setAuthorizations(authorizations);
        roleRepository.save(role);
    }
    

}
