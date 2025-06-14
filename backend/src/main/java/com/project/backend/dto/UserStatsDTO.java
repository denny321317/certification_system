package com.project.backend.dto;

import java.util.Map;

public class UserStatsDTO {
    private long totalUsers;
    private Map<String, Long> usersByRole;
    private long onlineUsers;

    public UserStatsDTO(long totalUsers, Map<String, Long> usersByRole, long onlineUsers) {
        this.totalUsers = totalUsers;
        this.usersByRole = usersByRole;
        this.onlineUsers = onlineUsers;
    }

    // Getters and Setters
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Map<String, Long> getUsersByRole() {
        return usersByRole;
    }

    public void setUsersByRole(Map<String, Long> usersByRole) {
        this.usersByRole = usersByRole;
    }

    public long getOnlineUsers() {
        return onlineUsers;
    }

    public void setOnlineUsers(long onlineUsers) {
        this.onlineUsers = onlineUsers;
    }
}