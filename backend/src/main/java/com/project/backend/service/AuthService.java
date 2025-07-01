package com.project.backend.service;

import com.project.backend.model.User;
import com.project.backend.model.Role;
import com.project.backend.repository.RoleRepository;
import com.project.backend.repository.UserRepository;
import com.project.backend.dto.UserDTO;
import com.project.backend.dto.RoleDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    private RoleRepository roleRepository; // 新增，用於解決 register() 中的 setRole() 衝突

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
            RoleDTO roleDTO = new RoleDTO(role.getId(), role.getName());
            dto.setRoleDTO(roleDTO);
        }
        return dto;
    }

    public Optional<User> login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user;
        }
        return Optional.empty();
    }

    public User register(String name, String email, String password, String department, String position) {
        User user = new User();
        Role role = roleRepository.findByName("User").get();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password); // 👉（正式版建議要加密處理）
        user.setRole(role);   // 改成以一個 Role Object 作為參數
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
    
    
}
