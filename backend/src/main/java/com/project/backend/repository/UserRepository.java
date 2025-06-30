package com.project.backend.repository;

import com.project.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.project.backend.model.Role;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRole(Role role);
    long countByRole(Role role);
    Optional<User> findByEmail(String email);
    Optional<User> findByPasswordResetToken(String passwordResetToken); // 根據 token 查詢用戶
    Optional<User> findById(Long id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.projectMemberships pm LEFT JOIN FETCH pm.project p WHERE u.id = :id")
    Optional<User> findByIdWithProjectMembership(@Param("id") Long id);
}
