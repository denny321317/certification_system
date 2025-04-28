package com.project.backend.service;


import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Ryan Chen<gtchen0823@gmail.com>");
        message.setTo(toEmail);
        message.setSubject("密碼重設請求");
        message.setText("要重設您的密碼，請點擊以下連結：" + resetLink);
    
        try {
            emailSender.send(message);
        } catch (Exception e) {
            // 錯誤處理: 例如記錄錯誤或拋出自定義異常
            System.out.println("發送郵件失敗：" + e.getMessage());
        }
    }
    
}
