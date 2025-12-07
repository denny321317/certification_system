package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CertTypeAverageProgressDTO {
    
    // 認證類型名稱
    private String certType;
    
    // 該類型專案的平均進度
    private double averageProgress;

}