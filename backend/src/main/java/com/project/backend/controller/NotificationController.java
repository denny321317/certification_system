package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.project.backend.service.NotificationService;
import com.project.backend.dto.NotificationDTO;
import com.project.backend.dto.UserDetailDTO;
import com.project.backend.model.Notification;

import java.util.List;
import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsForUser(@PathVariable Long userId) {
        List<NotificationDTO> notifications = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotificationsForUser(@PathVariable Long userId) {
        List<NotificationDTO> notifications = notificationService.getUnreadNotificationsForUser(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadNotificationCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCountForUser(userId);
        Map<String, Long> response = Collections.singletonMap("count", count);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{userId}/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long userId, @PathVariable Long notificationId) {
        notificationService.markNotificationsAsRead(userId, Collections.singletonList(notificationId));
        return ResponseEntity.ok().build();
    }

    /*
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsReadForUser(@PathVariable Long userId) {
        notificationService.markAllAsReadForUser(userId);
        return ResponseEntity.ok().build();
    }
    */

    /**
     * 
     * @param userIds
     * @param senderId =-1 for system generated notification, otherwise the id of the sender
     * @param topic
     * @param content
     * @return
     */
    @PostMapping("/post") 
    public ResponseEntity<Void> postNewNotification(@RequestBody NotificationDTO dto) {
        notificationService.createNotification(dto.getUserIds(), dto.getSenderId(), dto.getTopic(), dto.getContent());
        return ResponseEntity.ok().build();
    }

}
