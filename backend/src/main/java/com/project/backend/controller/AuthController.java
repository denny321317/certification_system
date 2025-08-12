package com.project.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.project.backend.model.User;
import com.project.backend.service.AuthService;
import com.project.backend.service.EmailService;
import com.project.backend.service.SecuritySettingsService;

import lombok.Data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
//@CrossOrigin(origins = "*") // 如果前端跟後端不同port，需要加這個
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private SecuritySettingsService securitySettingsService;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {

        Map<String, Object> response = new HashMap<>();
        try {
            Optional<User> user = authService.login(request.getEmail(), request.getPassword());
            if (user.isPresent()) {

                // 將 user 的 online 改成 true
                User loggedInUser = user.get();
                loggedInUser.setOnline(true);
                loggedInUser.setLastTimeLogin(LocalDateTime.now());
                authService.saveUser(loggedInUser);

                response.put("success", true);
                response.put("token", "mock_token");
                response.put("user", authService.toUserDTO(user.get()));
            } else {
                response.put("success", false);
                response.put("error", "帳號或密碼錯誤");
            }
        } catch (IllegalStateException e) {
            if ("suspended".equals(e.getMessage())) {
                response.put("success", false);
                response.put("error", "您的帳號已被停用，請聯絡管理員。");
            } else if ("password_not_compliant".equals(e.getMessage())) {
                response.put("token", "mock_token");
                response.put("success", false);
                response.put("error", "password_change_required");
                response.put("securitySettings", securitySettingsService.getSettings());

            } else {
                response.put("success", false);
                response.put("error", "未知錯誤");
            }
        }
        return response;
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        Optional<User> userOpt = authService.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setOnline(false);
            authService.saveUser(user);
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            return ResponseEntity.status(404).body(Map.of("success", false, "error", "User not found"));
        }
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest request) {
        User newUser = authService.register(request.getName(), request.getEmail(), request.getPassword(),request.getDepartment(),request.getPosition());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", "mock_token");
        response.put("user", authService.toUserDTO(newUser));
        return response;
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody ResetPasswordRequest request) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> user = authService.findByEmail(request.getEmail());
        
        if (user.isPresent()) {
            // 生成一個密碼重設的 token（你可以實現更安全的 token 生成邏輯）
            String resetToken = UUID.randomUUID().toString(); // 這是一個範例，應使用更安全的 token 生成方法

            // 創建密碼重設連結（該連結應該指向前端頁面，處理密碼重設）
            String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
            
            // 發送重設郵件
            emailService.sendPasswordResetEmail(request.getEmail(), resetLink);
            
            // 可選：將重設 token 儲存在資料庫中與用戶關聯
            authService.storePasswordResetToken(user.get(), resetToken);
            
            response.put("success", true);
            response.put("message", "密碼重設連結已寄送至您的電子郵件");
        } else {
            response.put("success", false);
            response.put("error", "找不到該 Email");
        }
        
        return response;
    }
    @PostMapping("/update-password")
    public Map<String, Object> updatePassword(@RequestBody UpdatePasswordRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // 檢查 token 是否有效並獲取用戶
        Optional<User> user = authService.findByPasswordResetToken(request.getToken());
        
        if (user.isPresent()) {
            // 在此處您可以選擇根據需求進行其他的 token 驗證（例如 token 的有效期等）
            
            // 更新用戶的密碼
            boolean isUpdated = authService.updatePassword(user.get(), request.getNewPassword());
            
            if (isUpdated) {
                response.put("success", true);
                response.put("message", "密碼已成功更新");
            } else {
                response.put("success", false);
                response.put("error", "密碼更新失敗，請稍後再試");
            }
        } else {
            response.put("success", false);
            response.put("error", "無效的重設 token");
        }
        
        return response;
    }

    /**
     * 專門於用戶被迫改密碼時(如: 密碼政策改變)使用
     * @param request
     * @return
     */
    @PostMapping("/update-password-for-compliancy")
    public Map<String, Object> updatePasswordForce(@RequestBody UpdatePasswordForceRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // 根據 email 獲取用戶
        Optional<User> user = authService.findByEmail(request.getEmail());
        
        if (user.isPresent()) {
            // 透過舊密碼檢查身份
            if (!user.get().getPassword().equals(request.getOldPassword())) {
                response.put("success", false);
                response.put("message", "身份驗證錯誤");
                return response;
            }
            
            // 更新用戶的密碼
            boolean isUpdated = authService.updatePassword(user.get(), request.getNewPassword());
            
            if (isUpdated) {
                response.put("success", true);
                response.put("message", "密碼已成功更新");
            } else {
                response.put("success", false);
                response.put("error", "密碼更新失敗，請稍後再試");
            }
        } else {
            response.put("success", false);
            response.put("error", "找不到 Email 為 " + request.email + " 的用戶");
        }
        
        return response;
    }
    
    @Data
    static class UpdatePasswordForceRequest {
        private String email;
        private String oldPassword;
        private String newPassword;
    }

    @Data
    static class UpdatePasswordRequest {
        private String token;       // 重設 token
        private String newPassword; // 新的密碼
    }


    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String department; 
        private String position; 
    }

    @Data
    static class ResetPasswordRequest {
        private String email;
    }
}
