package com.project.backend.service;

import com.project.backend.model.User;
import com.project.backend.model.Role;
import com.project.backend.repository.RoleRepository;
import com.project.backend.repository.UserRepository;


import jakarta.annotation.PostConstruct;

import com.project.backend.dto.UserDTO;
import com.project.backend.dto.RoleDTO;
import com.project.backend.model.SecuritySettings;
import com.project.backend.repository.SecuritySettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.time.LocalDateTime;
import java.util.Optional;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.Key;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository; // 新增，用於解決 register() 中的 setRole() 衝突
    @Autowired
    private SecuritySettingsRepository securitySettingsRepository;
    @Autowired
    private SecuritySettingsService securitySettingsService;

    /**
     * 用於比對用戶資訊(如: 密碼)是否符合安全設定
     * @return 資料庫中的安全設定
     */
    public SecuritySettings getSecuritySettings() {
        return securitySettingsRepository.findAll().stream().findFirst().orElse(createDefaultSettings());
    }

    private SecuritySettings createDefaultSettings() {
        SecuritySettings defaultSettings = new SecuritySettings();
        defaultSettings.setRequireMinLength(true);
        defaultSettings.setMinLength(8);
        defaultSettings.setRequireUpperLowerCase(false);
        defaultSettings.setRequireNumber(false);
        defaultSettings.setRequireSpecialChar(false);
        return securitySettingsRepository.save(defaultSettings);
    }




   

    /**
     * 為了解決 Hibernate lazy loading 問題
     * @param user
     * @return
     */
    public UserDTO toUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setDepartement(user.getDepartment());
        dto.setPosition(user.getPosition());
        if (user.getRole() != null) {
            Role role = user.getRole();
            RoleDTO roleDTO = toRoleDTO(role);
            dto.setRoleDTO(roleDTO);
        }
        return dto;
    }

    public RoleDTO toRoleDTO(Role role) {
        return new RoleDTO(
            role.getId(),
            role.getName(),
            role.isAllowReadSystemSettings(),
            role.isAllowWriteSystemSettings(),
            role.isAllowReadUserManagment(),
            role.isAllowWriteUserManagment(),
            role.isAllowReadDocumentManagment(),
            role.isAllowWriteDocumentManagment(),
            role.isAllowReadTemplateCenter(),
            role.isAllowWriteTemplateCenter(),
            role.isAllowReadCertificationProjects(),
            role.isAllowWriteCertificationProjects(),
            role.isAllowReadReportManagment(),
            role.isAllowWriteReportManagment(),
            role.isAllowReadSupplierManagement(),
            role.isAllowWriteSupplierManagement(),
            role.isAllowReadDashboard(),
            role.isAllowWriteDashboard()
        );        
    }

    public Optional<User> login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) return Optional.empty();
        
        
        User u = user.get();

        // If account is still locked due to failed login attempts
        if (u.getAccountLockedUntil() != null && LocalDateTime.now().isBefore(u.getAccountLockedUntil())) {
            throw new IllegalStateException("account_locked");
        }


        if (!u.getPassword().equals(password)) {
            registerFailedAttempt(u, getSecuritySettings());
            return Optional.empty();
        }

        if (Boolean.TRUE.equals(u.isSuspended())) {
            throw new IllegalStateException("suspended");
        }

        // Check if the password complys to the requirements of the security settings.
        SecuritySettings securitySettings = securitySettingsService.getSettings();
        if (!securitySettingsService.isPasswordCompliant(password, securitySettings)) {
            throw new IllegalStateException("password_not_compliant");
        }


        u.setFailedLoginAttempts(0);
        u.setAccountLockedUntil(null);
        userRepository.save(u);
        return Optional.of(u);
    
        
    }

    /**
     * 用於實作過多登入失敗後暫時鎖定
     * @param u: 用戶
     * @param settings: 安全設定
     */
    public void registerFailedAttempt(User u, SecuritySettings settings) {
        int attempts = u.getFailedLoginAttempts() + 1;
        u.setFailedLoginAttempts(attempts);
        if (attempts >= settings.getMaxLoginAttempts()) {
            if (settings.getMaxLoginLockMinutes() > 0) {
                u.setAccountLockedUntil(LocalDateTime.now().plusMinutes(settings.getMaxLoginLockMinutes()));
            }
            u.setFailedLoginAttempts(0); // reset after lock
        }
        userRepository.save(u);
        
    }

    public User register(String name, String email, String password, String department, String position) {
        User user = new User();
        Role role = roleRepository.findByName("一般使用者").get();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password); // 👉（正式版建議要加密處理）
        user.setRole(role);   // 改成以一個 Role Object 作為參數
        user.setAvatar(null);
        user.setDepartment(department);
        user.setPosition(position);
        user.setLastTimeLogin(java.time.LocalDateTime.now());
        return userRepository.save(user);
    }

    public Optional<User> updateProfile(Long id, String name, String avatar) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setName(name != null ? name : user.getName());
            user.setAvatar(avatar != null ? avatar : user.getAvatar());
            userRepository.save(user);
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void storePasswordResetToken(User user, String resetToken) {
        // 將 token 儲存在 User 實體中
        user.setPasswordResetToken(resetToken);
        
        // 儲存更新後的 User 資料到資料庫
        userRepository.save(user);
    }

    public Optional<User> findByPasswordResetToken(String token) {
        // 根據 token 查找用戶，這裡的實現需要您根據實際的資料庫設計來實現
        return userRepository.findByPasswordResetToken(token);
    }
    
    public boolean updatePassword(User user, String newPassword) {
        // 更新用戶的密碼，並保存
        user.setPassword(newPassword); // 可以在這裡進行密碼加密
        userRepository.save(user);
        return true;
    }

    // 用來更改用戶的 online 狀態
    public void saveUser(User user) {
        userRepository.save(user);
    }

  
    
}
