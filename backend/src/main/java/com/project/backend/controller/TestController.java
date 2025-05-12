package com.project.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

<<<<<<< HEAD
    // 測試端點，當你訪問 http://localhost:8000/api/test 時，會回傳 "Backend is running!"
    @GetMapping("/test")
=======
    // 測試端點，當你訪問 http://localhost:8080/api/test 時，會回傳 "Backend is running!"
    @GetMapping("/api/test")
>>>>>>> e0ad6132a7c6ad02e72be42522270a7533388ba5
    public String testEndpoint() {
        return "Backend is running!";
    }
}
