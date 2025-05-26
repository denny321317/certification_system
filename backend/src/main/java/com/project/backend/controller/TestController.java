package com.project.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

    // 測試端點，當你訪問 http://localhost:8080/api/test 時，會回傳 "Backend is running!"
    @GetMapping("/test")
    public String testEndpoint() {
        return "Backend is running!";
    }
}
