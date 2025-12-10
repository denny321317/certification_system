package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertTypeCountDTO {
    
    // 認證類型名稱 (例如: "semta", "iso", "無認證")
    private String certType; 
    
    // 該類型專案的數量
    private Long count;
}