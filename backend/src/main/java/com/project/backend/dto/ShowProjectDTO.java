package com.project.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowProjectDTO {
  private long id;
  private String name;
  private String status;
  private String startDate;
  private String endDate;
  private String internalReviewDate;
  private String externalReviewDate;
  private String manager;
  private String agency;
  private String progressColor;
  private Integer progress;



}
