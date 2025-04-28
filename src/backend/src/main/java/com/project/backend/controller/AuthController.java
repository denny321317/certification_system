package com.project.backend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.project.backend.model.User;
import com.project.backend.service.AuthService;
import lombok.Data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
//@CrossOrigin(origins = "*") // 如果前端跟後端不同port，需要加這個
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

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
        boolean found = authService.resetPassword(request.getEmail());
        Map<String, Object> response = new HashMap<>();
        if (found) {
            response.put("success", true);
            response.put("message", "密碼重設連結已寄出");
        } else {
            response.put("success", false);
            response.put("error", "找不到該Email");
        }
        return response;
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
