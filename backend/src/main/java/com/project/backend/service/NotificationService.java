package com.project.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.backend.repository.NotificationRepository;
import com.project.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

import com.project.backend.dto.NotificationDTO;
import com.project.backend.model.Notification;
import com.project.backend.model.User;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public long getUnreadCountForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        return notificationRepository.countUnreadByUserId(user.getId());
    }

    public List<NotificationDTO> getNotificationsForUser(Long userId) {
        List<Notification> nots = notificationRepository.findByUserIdInUserIdsOrderByTimestampDesc(userId);
        List<NotificationDTO> dtos = nots.stream()
            .map(n -> new NotificationDTO(n.getId(), n.getUserIds(), n.getSenderId(), n.getTopic(), n.getContent(), n.getTimestamp(), n.isReadByUser(userId)))
            .collect(Collectors.toList());
        return dtos;
    }

    public List<NotificationDTO> getUnreadNotificationsForUser(Long userId) {
        List<Notification> nots = notificationRepository.findByUserIdInUserIdsAndIsReadFalse(userId); 
        List<NotificationDTO> dtos = nots.stream()
            .map(n -> new NotificationDTO(n.getId(), n.getUserIds(), n.getSenderId(), n.getTopic(), n.getContent(), n.getTimestamp(), n.isReadByUser(userId)))
            .collect(Collectors.toList());
        return dtos;
    }

    /**
     * 
     * @param userIds
     * @param senderId -1 for system generated notifications
     * @param topic
     * @param content
     * @return
     */
    public Notification createNotification(List<Long> userIds, Long senderId, String topic, String content) {
        Notification notification = new Notification(userIds, senderId, topic, content);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markNotificationsAsRead(Long userId, List<Long> notificationIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<Notification> notifications = notificationRepository.findAllById(notificationIds);
        for (Notification notification : notifications) {
            if (notification.getReadStatus().containsKey(userId)) {
                notification.getReadStatus().put(userId, true);
            }
        }
        notificationRepository.saveAll(notifications);
    }
    

}
