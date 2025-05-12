package com.project.backend.service;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

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
