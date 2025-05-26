package com.project.backend.service;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import com.project.backend.model.User;
import com.project.backend.model.Role;
import com.project.backend.repository.UserRepository;
import com.project.backend.repository.RoleRepository;
import com.project.backend.dto.UserCreationDTO;
import com.project.backend.dto.RoleCreationDTO;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserManagementService(UserRepository userRepository, RoleRepository roleRepository){
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public User createUser(UserCreationDTO userDTO){
        Role role = roleRepository.findByName(userDTO.getRoleName());
        if (role == null){
            throw new IllegalArgumentException("Role not found: " + userDTO.getRoleName());
        }

        // TODO: check email, needs some more work to work properly

        User user = new User(userDTO.getName(), role, userDTO.getEmail(), userDTO.getDepartment());
        return userRepository.save(user);   
    }

    /**
     * the old version of createUser not using DTO
     */
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

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
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

    /**
     * create a new role that was not in the database
     * @param roleDTO the DTO for RoleCreation, contains the name of the new role and a boolean array of authorizations
     * @return the Role object of the new role
     * 
     */
    public Role createRole(RoleCreationDTO roleDTO){
        // check if the role already exist
        if (roleRepository.findByName(roleDTO.getRoleName()) != null) {
            throw new IllegalArgumentException("Role already exists: " + roleDTO.getRoleName());
        }
        
        Role newRole = new Role();
        newRole.setName(roleDTO.getRoleName());
        newRole.setAuthorizations(roleDTO.getAuthorizations());
        return roleRepository.save(newRole);
    }

    /**
     * Updates the authorizations for a given role.
     * The authorizations array must correspond to the predefined order of permissions in the Role entity:
     * 0: allowSystemSettings
     * 1: allowUserManagment
     * 2: allowDocumentManagment
     * 3: allowTemplateCenter
     * 4: allowCertificationProjects
     * 5: allowReportManagment
     * 6: allowSupplierManagement
     * @param roleName The name of the role to update.
     * @param authorizations A boolean array representing the new authorizations.
     * @return The updated Role object.
     * @throws IllegalArgumentException if the role is not found or the authorizations array is invalid.
     */
    public Role updateRoleAuthorizations(String roleName, boolean[] authorizations) {
        Role role = roleRepository.findByName(roleName);
        if (role == null) {
            throw new IllegalArgumentException("Role not found: " + roleName);
        }
        // The Role.setAuthorizations method already validates the array length
        role.setAuthorizations(authorizations);
        return roleRepository.save(role);
    }

    /**
     * updates the Role of a user
     * @param userId
     * @param newRoleName
     * @return
     */
    public User updateUserRole(Long userId, String newRoleName){
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found" + userId));
        Role newRole = roleRepository.findByName(newRoleName);
        if (newRole == null){
            throw new IllegalArgumentException("Role not found" + newRoleName);
        }
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public long getTotalUserCount(){
        return userRepository.count();
    }
    
    public Map<String, Long> getUserCountsByRole(){
        Map<String, Long> countsByRole = new HashMap<>();
        List<Role> roles = roleRepository.findAll();
        for(Role role : roles){
            countsByRole.put(role.getName(), userRepository.countByRole(role));
        }
        return countsByRole;
    }

    //TODO: This is still a placeholder
    public long getOnlineUserCount() {
        // NOTE: Tracking online users requires a dedicated mechanism.
        // This could involve:
        // 1. A 'lastActive' timestamp on the User entity, updated on each request.
        //    You would then count users with 'lastActive' within a recent timeframe (e.g., last 5 minutes).
        // 2. Using WebSockets and tracking active sessions.
        // 3. Integrating with Spring Session if you store session information in a shared datastore.
        // For this example, a placeholder value is returned.
        // You would need to implement the actual logic based on your chosen strategy.
        // For instance, if you had a User field 'isOnline':
        // return userRepository.countByIsOnlineTrue();
        return 0; // Placeholder - implement actual online user tracking
    }


    

}
