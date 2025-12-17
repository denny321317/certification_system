package com.project.backend.model;

import jakarta.annotation.Generated;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;



/**
 * 對應到前端系統設置裡的安全設定
 */
@Entity
@Data
public class SecuritySettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean requireMinLength;
    private int minLength;
    private boolean requireUpperLowerCase;
    private boolean requireNumber;
    private boolean requireSpecialChar;


    private boolean enableTwoFactor;
    private int maxLoginAttempts;
    private int maxLoginLockMinutes;  // 登入失敗一定次數後被鎖定的時間，以分鐘記

    private int sessionTimeoutMinutes;



    /* Getters and Setters */
    
    public int getMaxLoginLockMinutes() {
        return maxLoginLockMinutes;
    }

    public void setMaxLoginLockMinutes(int min) {
        this.maxLoginLockMinutes = min;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isRequireMinLength() {
        return requireMinLength;
    }

    public void setRequireMinLength(boolean requireMinLength) {
        this.requireMinLength = requireMinLength;
    }

    public int getMinLength() {
        return minLength;
    }

    public void setMinLength(int minLength) {
        this.minLength = minLength;
    }

    public boolean isRequireUpperLowerCase() {
        return requireUpperLowerCase;
    }

    public void setRequireUpperLowerCase(boolean requireUpperLowerCase) {
        this.requireUpperLowerCase = requireUpperLowerCase;
    }

    public boolean isRequireNumber() {
        return requireNumber;
    }

    public void setRequireNumber(boolean requireNumber) {
        this.requireNumber = requireNumber;
    }

    public boolean isRequireSpecialChar() {
        return requireSpecialChar;
    }

    public void setRequireSpecialChar(boolean requireSpecialChar) {
        this.requireSpecialChar = requireSpecialChar;
    }

    public boolean isEnableTwoFactor() {
        return enableTwoFactor;
    }

    public void setEnableTwoFactor(boolean enableTwoFactor) {
        this.enableTwoFactor = enableTwoFactor;
    }

    public int getMaxLoginAttempts() {
        return maxLoginAttempts;
    }

    public void setMaxLoginAttempts(int maxLoginAttempts) {
        this.maxLoginAttempts = maxLoginAttempts;
    }

    public int getSessionTimeoutMinutes() {
        return sessionTimeoutMinutes;
    }

    public void setSessionTimeoutMinutes(int sessionTimeoutMinutes) {
        this.sessionTimeoutMinutes = sessionTimeoutMinutes;
    }

}
