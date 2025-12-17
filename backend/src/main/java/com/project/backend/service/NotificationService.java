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
import org.springframework.data.domain.Sort;

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
        List<Notification> nots = notificationRepository.findNotificationsForUser(userId);
        List<NotificationDTO> dtos = nots.stream()
            .map(n -> new NotificationDTO(n.getId(), n.getUserIds(), n.getSenderId(), n.getTopic(), n.getContent(), n.getTimestamp(), n.isReadByUser(userId)))
            .collect(Collectors.toList());
        return dtos;
    }

    public List<NotificationDTO> getUnreadNotificationsForUser(Long userId) {
        List<Notification> nots = notificationRepository.findUnreadByUserId(userId); 
        List<NotificationDTO> dtos = nots.stream()
            .map(n -> new NotificationDTO(n.getId(), n.getUserIds(), n.getSenderId(), n.getTopic(), n.getContent(), n.getTimestamp(), n.isReadByUser(userId)))
            .collect(Collectors.toList());
        return dtos;
    }

    public List<NotificationDTO> getAllNotifications() {
        List<Notification> nots = notificationRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
        // For an admin view, 'read' status is not specific to one user, so we default to false.
        return nots.stream()
            .map(n -> new NotificationDTO(n.getId(), n.getUserIds(), n.getSenderId(), n.getTopic(), n.getContent(), n.getTimestamp(), false))
            .collect(Collectors.toList());
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
            if (notification.getUserIds().contains(userId)) {
                notification.setIsReadForUser(userId, true);
            }
        }
        notificationRepository.saveAll(notifications);
    }
    
    @Transactional
    public void properDeleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found with id: " + notificationId);
        }
        notificationRepository.deleteById(notificationId);
        

    }

    public void deleteNotificationForUserOnly(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        // Remove the user from the list of recipients
        notification.getUserIds().remove(userId);

        // Also remove the user from the read status map
        notification.getReadStatus().remove(userId);

        notificationRepository.save(notification);
    }

}
