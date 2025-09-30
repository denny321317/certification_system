package com.project.backend.dto;

import java.util.List;
import java.time.LocalDateTime;

public class NotificationDTO {
    private Long id;
    private List<Long> userIds;
    private Long senderId;
    private String topic;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;

    // Default constructor
    public NotificationDTO() {}

    // Constructor with all fields
    public NotificationDTO(Long id, List<Long> userIds, Long senderId, String topic, String content, LocalDateTime timestamp, boolean isRead) {
        this.id = id;
        this.userIds = userIds;
        this.senderId = senderId;
        this.topic = topic;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }
}