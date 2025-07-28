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
    private int sessionTimeoutMinutes;

}
