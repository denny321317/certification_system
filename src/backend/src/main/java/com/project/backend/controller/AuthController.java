package com.project.backend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.project.backend.model.User;
import com.project.backend.service.AuthService;
import com.project.backend.service.EmailService;

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

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        Optional<User> user = authService.login(request.getEmail(), request.getPassword());
        Map<String, Object> response = new HashMap<>();
        if (user.isPresent()) {
            response.put("success", true);
            response.put("token", "mock_token"); // 👉 實際應該產生 JWT
            response.put("user", user.get());
        } else {
            response.put("success", false);
            response.put("error", "帳號或密碼錯誤");
        }
        return response;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest request) {
        User newUser = authService.register(request.getName(), request.getEmail(), request.getPassword(),request.getDepartment(),request.getPosition());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", "mock_token");
        response.put("user", newUser);
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
            //authService.storePasswordResetToken(user.get(), resetToken);
            
            response.put("success", true);
            response.put("message", "密碼重設連結已寄送至您的電子郵件");
        } else {
            response.put("success", false);
            response.put("error", "找不到該 Email");
        }
        
        return response;
    }
    /* 
    @PostMapping("/test/send-email")
    public ResponseEntity<Map<String, Object>> sendTestEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        emailService.sendPasswordResetEmail(email, "https://example.com/reset-password?token=testtoken");

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "測試郵件已寄出");

        return ResponseEntity.ok(response);
    }
    */

    


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
