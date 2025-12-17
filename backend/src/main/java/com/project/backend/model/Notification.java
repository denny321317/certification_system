package com.project.backend.model;

import jakarta.annotation.Generated;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKey;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.HashMap;

@Data
@Entity
@NoArgsConstructor
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "notification_user_ids", joinColumns = @JoinColumn(name = "notification_id"))
    @Column(name = "user_id")
    private List<Long> userIds = new ArrayList<>();  // the user Id of the receiver
    
    @Column(name="is_read")
    private Boolean isRead = false;

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "notification_read_status", joinColumns = @JoinColumn(name = "notification_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "readStatus")
    private Map<Long, Boolean> readStatus = new HashMap<>();

    @Column(nullable = false)
    private Long senderId;  // The user Id of the sender, -1 means sent automatically by the system

    /**
     * Constructor for a Notification
     * @param userIds the receivers of this notification
     * @param senderId -1 for notifications sent automatically by the system, user Id of the sender for normal use
     * @param topic
     * @param content
     */
    public Notification(List<Long> userIds, Long senderId, String topic, String content) {
        this.userIds = userIds;
        this.senderId = senderId;
        this.topic = topic;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.isRead = false; // It's good practice to initialize it.
        this.userIds.forEach(userId -> this.readStatus.put(userId, false));
    }

     // Getters
    public Long getId() {
        return id;
    }

    public List<Long> getUserIds() {
        return userIds;
    }

    public Long getSenderId() {
        return senderId;
    }

    public String getTopic() {
        return topic;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Map<Long, Boolean> getReadStatus() {
        return readStatus;
    }

    public boolean isReadByUser(Long userId) {
        return readStatus.getOrDefault(userId, false);
    }
    

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setReadStatus(Map<Long, Boolean> readStatus) {
        this.readStatus = readStatus;
    }

    public void setIsReadForUser(Long userId, boolean isRead) {
        this.readStatus.put(userId, isRead);
    }

}
