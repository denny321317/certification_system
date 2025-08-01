package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpServerErrorException.NotImplemented;
import org.springframework.beans.factory.annotation.*;

import com.project.backend.service.UserManagementService;
import com.project.backend.model.User;
import com.project.backend.dto.UserStatsDTO;
import com.project.backend.dto.UserUpdateDTO;
import com.project.backend.model.Role;
import com.project.backend.dto.UserCreationDTO;
import com.project.backend.dto.UserDTO;
import com.project.backend.dto.UserDetailDTO;
import com.project.backend.dto.UserRoleUpdateDTO;
import com.project.backend.dto.RoleCreationDTO;
import com.project.backend.dto.RoleRenameDTO;

import java.lang.StackWalker.Option;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/user-management")
@CrossOrigin(origins = "http://localhost:3000")
public class UserManagementController {
    
    @Autowired
    private UserManagementService userManagementService;

    

    @GetMapping("/allUsers")
    public ResponseEntity<List<UserDetailDTO>> getAllUsers(){
        List<UserDetailDTO> users = userManagementService.getAllUsersAsDTO();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/allRoles")
    public ResponseEntity<List<Role>> getAllRoles(){
        List<Role> roles = userManagementService.getAllRoles();
        return ResponseEntity.ok(roles);
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


    /**
     * This API uses PUT method.
     * The role whose authorizations to be altered is set as a PathVariable and should be in the request URL
     * The request body should be a JSON array of booleans.
     * Example: [true, false, true, true, false, true, true, true, false, true, false, false, false, false, true, false]
     * 
     * @param roleName the role whose authorizations to be altered, PathVariable
     * @param authorizations a boolean Array of Authorizations.
     *  Each index corresponds to different authorization.
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
     * @return
     * 
     */
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
     * Update the name of a Role.
     * Attention: Roles with IDs 1~5 are protected roles. They may not be deleted nor can their names be changed.
     * @param currentRoleName
     * @param roleRenameDTO
     * @return
     */
    @PutMapping("/role/{currentRoleName}/name")
    public ResponseEntity<?> updateRoleName(
        @PathVariable String currentRoleName,
        @Valid @RequestBody RoleRenameDTO roleRenameDTO
    ) {
        try {
            Role updatedRole = userManagementService.updateRoleName(currentRoleName, roleRenameDTO.getNewName());
            return ResponseEntity.ok(updatedRole);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occured updating the role name: " + e.getMessage());
        }

    }


    @DeleteMapping("/role/{roleId}") 
    public ResponseEntity<?> deleteRole(@PathVariable Long roleId) {
        try {
            userManagementService.deleteRole(roleId);
            return ResponseEntity.ok().body("Role with ID: " + roleId + " is successfully deleted");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred while deleting the user account: " + e.getMessage());
        }
    }

    @GetMapping("/role/{roleName}/getRole")
    public ResponseEntity<?> getAuthByRole (@PathVariable String roleName) {
        try {
            Role role = userManagementService.getRole(roleName);
            return ResponseEntity.ok(role);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occured");
        }
    }


    
    /**
     * This API is for looking at details of a specific user
     * @param id
     * @return
     */
    @GetMapping("/user/getInfo")
    public ResponseEntity<?> getUserInfo(@RequestParam Long id){
        try {
            Optional<UserDetailDTO> userDetailDTOOptional = userManagementService.getUser(id);
            if (userDetailDTOOptional.isPresent()) {
                return ResponseEntity.ok(userDetailDTOOptional.get());
            } else {
                return ResponseEntity.notFound().build();
            }


        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occured: " + e.getMessage());
        }

    }


    /**
     * This API is for suspending a user 
     * @param userId The ID of the user to suspend
     * @return The updated User object with suspended status, or an error response.
     */
    @PutMapping("/user/{userId}/suspend")
    public ResponseEntity<?> suspendUserAccount(@PathVariable Long userId) {
        try {
            User suspendedUser = userManagementService.suspendUser(userId);
            return ResponseEntity.ok(suspendedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occured while suspending the user account: " + e.getMessage());
        }
    }

    /**
     * Unsuspend/Reactivate a user account that was previously suspended
     * @param userId The ID of the user whose account is going to be reactivated
     * @return The updated User object unsuspended, or an error response
     */
    @PutMapping("/user/{userId}/unsuspend") 
    public ResponseEntity<?> unsuspendUserAccount(@PathVariable Long userId) {
        try {
            User unsuspendedUser = userManagementService.unsuspendUser(userId);
            return ResponseEntity.ok(unsuspendedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("An unexpected error occured while unsuspending the user account: " + e.getMessage());  
        }
    }


    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteUserAccount(@PathVariable Long userId) {
        try {
            userManagementService.deleteUser(userId);
            return ResponseEntity.ok().body("User account with ID: " + userId + "deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred while deleting the user account: " + e.getMessage());
        }
    }









    /**
     * This API takes in json reqeust body
     * example request body:
     * {
  "name": "Test_add_user",
  "email": "testadduser@example.com",
  "roleName": "Admin",
  "department": "IT"
}
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

    
    /**
     * This API takes in json reqeust body
     * example request body:
     * {
  "roleName": "Test_add_role",
  "authorizations": [true, false, true, true, false, false, false, true]
} 
     *Each index corresponds to different authorization.
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
     * @param roleDTO
     * @return
     * 
     */
    @PostMapping("/createRole")
    public ResponseEntity<?> createRole(@RequestBody RoleCreationDTO roleDTO){
        try {
            Role newRole = userManagementService.createRole(roleDTO);
            return new ResponseEntity<>(newRole, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occured while creating the role");
        }
    }
    

    // TODO: alter the role of a user
    /**
     * Alters the role of a user.
     * Example request body:
     * {
     *   "userId": 123,
     *   "newRoleName": "Admin"
     * }
     */
    @PutMapping("/user/role")
    public ResponseEntity<?> updateUserRole(@RequestBody UserRoleUpdateDTO dto){
        try{
            User updatedUser = userManagementService.updateUserRole(dto.getUserId(), dto.getNewRoleName());
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occured while updating the user role");
        }
    }
    

    
    /**
     * This API is for updating user information for the edit user function in the frontend
     * @param userId
     * @param userUpdateDTO
     * @return the updated User
     */
    @PutMapping("/user/update/{userId}")
    public ResponseEntity<?> updateUserInfo(@PathVariable Long userId, @Valid @RequestBody UserUpdateDTO userUpdateDTO) {
        try {
            User updatedUser = userManagementService.updateUserInfo(userId, userUpdateDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpeccted error occured while updating user information: " + e.getMessage());
        }
    }
    
}
