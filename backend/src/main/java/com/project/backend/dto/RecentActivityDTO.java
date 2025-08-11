package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDTO {
    private Long id;         // 活動ID
    private String user;     // 用戶名稱
    private String action;   // 執行的動作
    private String target;   // 操作對象
    private String timestamp; // 時間戳 (字串格式)
    private String type;     // 活動類型
}
