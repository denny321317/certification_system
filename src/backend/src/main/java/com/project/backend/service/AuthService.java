package com.project.backend.service;

import com.project.backend.model.User;
import com.project.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user;
        }
        return Optional.empty();
    }

    public User register(String name, String email, String password, String department, String position) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password); // 👉（正式版建議要加密處理）
        user.setRole("一般用戶");
        user.setAvatar(null);
        user.setDepartment(department);
        user.setPosition(position);
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


    
}
