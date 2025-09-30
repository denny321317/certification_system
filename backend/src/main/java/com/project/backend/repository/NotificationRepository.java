package com.project.backend.repository;

import com.project.backend.model.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long>{
    @Query("SELECT n FROM Notification n WHERE :userId MEMBER OF n.userIds ORDER BY n.timestamp DESC")
    List<Notification> findByUserIdInUserIdsOrderByTimestampDesc(@Param("userId") Long userId);


    List<Notification> findByUserIdsContaining(Long userId);

    @Query("SELECT count(n) FROM Notification n JOIN n.readStatus rs WHERE KEY(rs) = :userId AND rs = false")
    long countUnreadByUserId(@Param("userId") Long userId);
}
