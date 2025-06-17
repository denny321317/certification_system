package com.project.backend.service;

import java.util.List;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.project.backend.model.User;
import com.project.backend.model.Project;
import com.project.backend.model.Role;
import com.project.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

import com.project.backend.repository.RoleRepository;


import com.project.backend.dto.UserCreationDTO;
import com.project.backend.dto.UserDTO;
import com.project.backend.dto.UserDetailDTO;
import com.project.backend.dto.UserUpdateDTO;
import com.project.backend.dto.ProjectTeamDTO;
import com.project.backend.dto.ProjectUserManagementDTO;
import com.project.backend.dto.RoleCreationDTO;
import com.project.backend.dto.RoleDTO;


@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    public static final List<Long> PROTECTED_ROLE_IDS = List.of(1L, 2L, 3L, 4L, 5L);

    public UserManagementService(UserRepository userRepository, RoleRepository roleRepository){
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }


   
    /**
     * This function is for attaining the information of a specific user
     * @param id the User ID
     * @return the user with that ID in DTO form 
     */
    public Optional<UserDetailDTO> getUser(Long id){
        Optional<User> userOptional = userRepository.findByIdWithProjectMembership(id);
        
        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        User user = userOptional.get();

        RoleDTO roleDTO = null;
        if (user.getRole() != null) {
            roleDTO = new RoleDTO(user.getRole().getId(), user.getRole().getName());
        }

        // mapping ProjectTeam to ProjectTeamDTO
        List<ProjectTeamDTO> projectTeamDTOs = user.getProjectMemberships().stream()
            .map(projectTeam -> {
                Project project = projectTeam.getProject();
                ProjectUserManagementDTO projectDTO = null;
                if (project != null) {
                    projectDTO = new ProjectUserManagementDTO(
                        project.getId(), 
                        project.getName(), 
                        project.getStatus());
                }
                return new ProjectTeamDTO(projectTeam.getId(), projectDTO, projectTeam.getRoleInProject());
            })
            .collect(Collectors.toList());

        UserDetailDTO userDetailDTO = new UserDetailDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            roleDTO,
            user.getDepartment(),
            user.getLastTimeLogin(),
            user.isOnline(),
            projectTeamDTOs,
            user.isSuspended()
        );

        return Optional.of(userDetailDTO);

    }

    public User createUser(UserCreationDTO userDTO){
        Role role = roleRepository.findByName(userDTO.getRoleName()).get();
        if (role == null){
            throw new IllegalArgumentException("Role not found: " + userDTO.getRoleName());
        }

        // TODO: check email, needs some more work to work properly

        User user = new User(userDTO.getName(), role, userDTO.getEmail(), userDTO.getDepartment());
        return userRepository.save(user);   
    }


    /**
     * This function is for editing user 
     * @param userId
     * @param userUpdateDTO
     * @return
     */
    @Transactional
    public User updateUserInfo(Long userId, UserUpdateDTO userUpdateDTO){
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        
        // check if the Email is already used
        if (!user.getEmail().equals(userUpdateDTO.getEmail()) && userRepository.findByEmail(userUpdateDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already used: " + userUpdateDTO.getEmail());
        }

        Role newRole = roleRepository.findByName(userUpdateDTO.getRoleName())
            .orElseThrow(() -> new IllegalArgumentException("Role not found: "  + userUpdateDTO.getRoleName()));


        user.setName(userUpdateDTO.getName());
        user.setEmail(userUpdateDTO.getEmail());
        user.setRole(newRole);
        user.setDepartment(userUpdateDTO.getDepartment());

        user.setLastTimeLogin(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * the old version of createUser not using DTO
     */
    @Deprecated
    public User createUser(String name, String email, String roleName, String deparment){
        Role role = roleRepository.findByName(roleName).get();
        if (role == null){
            throw new IllegalArgumentException("Role not found: " + roleName);
        }

        User user = new User(roleName, role, email, deparment);
        return userRepository.save(user);
    }


    /**
     * This method is used to suspend a user
     * @param userId
     * @return
     */
    @Transactional
    public User suspendUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User with ID: " + userId + " not found"));
        
        if (user.isSuspended()){
            throw new IllegalArgumentException("User with ID: "+ userId + " is already suspended");
        }

        user.setSuspended(true);
        return userRepository.save(user);
    }

    /**
     * This method is used to unsuspend a user who was previously suspended
     * @param userId
     * @return
     */
    @Transactional
    public User unsuspendUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User with ID: " + userId + " not found"));

        if (!user.isSuspended()) {
            throw new IllegalArgumentException("User with ID: " + userId + " is not suspended");
        }

        user.setSuspended(false);
        return userRepository.save(user);
    }


    /**
     * Delete a user account from the database.
     * A user can only be deleted if their account is suspended.
     * @param userId The ID of the user to delete
     * @throws IllegalArgumentException if the user is not suspended.
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User with ID: " + userId + " not found"));
        
        if (!user.isSuspended()) {
            throw new IllegalArgumentException("User needs to be first suspended before being deleted");
        }



        userRepository.delete(user);
    }


    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public List<User> getUsersByRole(String roleName){
        Role role = roleRepository.findByName(roleName).get();
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
        if (roleRepository.findByName(roleDTO.getRoleName()).isPresent()) {
            throw new IllegalArgumentException("Role already exists: " + roleDTO.getRoleName());
        }
        
        Role newRole = new Role();
        newRole.setName(roleDTO.getRoleName());
        newRole.setAuthorizations(roleDTO.getAuthorizations());
        return roleRepository.save(newRole);
    }


    
    /**
     * This method is for changing the name of an existing role
     * @param currentRoleName
     * @param newRoleNameFromDTO
     * @return
     */
    @Transactional
    public Role updateRoleName(String currentRoleName, String newRoleNameFromDTO) {

        // The original five roles are protected from name changing
        if (PROTECTED_ROLE_IDS.contains(roleRepository.findByName(currentRoleName).get().getId())) {
            throw new IllegalArgumentException("The Role you are trying to update is a protected role. It is not allowed to be updated");
        }
        
        
        if (newRoleNameFromDTO == null || newRoleNameFromDTO.trim().isEmpty()){
            throw new IllegalArgumentException("New role name cannot be empty");
        }
        
        Role roleToUpdate = roleRepository.findByName(currentRoleName).get();
        if (roleToUpdate == null) {
            throw new IllegalArgumentException("Role '" + currentRoleName + "' not found.");
        }

        roleToUpdate.setName(newRoleNameFromDTO);

        return roleRepository.save(roleToUpdate);

    }

    /**
     * Updates the authorizations for a given role.
     * The authorizations array must correspond to the predefined order of permissions in the Role entity:
     * 0: allowReadSystemSettings
     * 1: allowWriteSystemSettings
     * 2: allowReadUserManagment
     * 3: allowWriteUserManagment
     * 4: allowReadDocumentManagment
     * 5: allowWriteDocumentManagment
     * 6: allowReadTemplateCenter
     * 7: allowWriteTemplateCenter
     * 8: allowReadCertificationProjects
     * 9: allowWriteCertificationProjects
     * 10: allowReadReportManagment
     * 11: allowWriteReportManagment
     * 12: allowReadSupplierManagement
     * 13: allowWriteSupplierManagement
     * 14: allowReadDashboard
     * 15: allowWriteDashboard
     * @param roleName The name of the role to update.
     * @param authorizations A boolean array representing the new authorizations.
     * @return The updated Role object.
     * @throws IllegalArgumentException if the role is not found or the authorizations array is invalid.
     */
    public Role updateRoleAuthorizations(String roleName, boolean[] authorizations) {
        Role role = roleRepository.findByName(roleName).get();
        if (role == null) {
            throw new IllegalArgumentException("Role not found: " + roleName);
        }
        // The Role.setAuthorizations method already validates the array length
        role.setAuthorizations(authorizations);
        return roleRepository.save(role);
    }

    public Role getRole(String roleName){
        Role role = roleRepository.findByName(roleName).get();
        if (role == null){
            throw new IllegalArgumentException("Role not found: " + roleName);
        }
        return role;
    }


    @Transactional
    public void deleteRole(Long roleId) {
        
        Role roleToBeDeleted = roleRepository.findById(roleId)
            .orElseThrow(() -> new IllegalArgumentException("Role with ID: "+ roleId + " not found"));
        
        // protected Roles
        if (PROTECTED_ROLE_IDS.contains(roleToBeDeleted.getId())) {
            throw new IllegalArgumentException("This role is a protected role. It cannot be deleted");
        }

        roleRepository.delete(roleToBeDeleted);
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
        Role newRole = roleRepository.findByName(newRoleName).get();
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
