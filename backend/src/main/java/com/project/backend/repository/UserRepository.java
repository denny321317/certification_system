package com.project.backend.repository;

import com.project.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.project.backend.model.Role;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRole(Role role);
    long countByRole(Role role);
    List<User> findByEmail(String email);
    Optional<User> findByPasswordResetToken(String passwordResetToken); // 根據 token 查詢用戶
}
