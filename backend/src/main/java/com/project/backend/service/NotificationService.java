package com.project.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.backend.repository.NotificationRepository;
import com.project.backend.dto.NotificationDTO;
import com.project.backend.model.Notification;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<NotificationDTO> getNotificationsForUser(Long userId) {
        List<Notification> nots = notificationRepository.findByUserIdInUserIdsOrderByTimestampDesc(userId);
        List<NotificationDTO> dtos = nots.stream()
            .map(n -> new NotificationDTO(n.getId(), n.getUserIds(), n.getSenderId(), n.getTopic(), n.getContent(), n.getTimestamp(), n.isRead()))
            .collect(Collectors.toList());
        return dtos;
    }

    public List<NotificationDTO> getUnreadNotificationsForUser(Long userId) {
        List<Notification> nots = notificationRepository.findByUserIdInUserIdsAndIsReadFalse(userId); 
        List<NotificationDTO> dtos = nots.stream()
            .map(n -> new NotificationDTO(n.getId(), n.getUserIds(), n.getSenderId(), n.getTopic(), n.getContent(), n.getTimestamp(), n.isRead()))
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

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElseThrow();
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsReadForUser(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdInUserIdsAndIsReadFalse(userId);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
    

}
