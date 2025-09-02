package com.example.demo.model;

import java.time.LocalDate;
import java.util.List;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.ElementCollection;
@Entity
@Table(name = "supplier")  
public class Supplier {
   @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String name;
  private String status;  // "approved", "pending", "high-risk"
  private String location;
  private String since;
  private Integer certifications;
  private String riskLevel;  // "low", "medium", "high"
    @ElementCollection
  private List<String> categories;

  // 最新認證資訊
  private String latestCertificationName;
  private LocalDate latestCertificationDate;

  // 認證到期提醒
  private String expirationCertificationName;
  private Integer daysLeft;

  // 進行中的認證
  private String ongoingCertificationName;
  private Integer ongoingCertificationProgress;

  // 風險原因與所需行動
  private String riskReason;
  private String actionNeededName;
  private Integer overdueDays;

  // setters and getters
public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public String getName() { return name; }
public void setName(String name) { this.name = name; }

public String getStatus() { return status; }
public void setStatus(String status) { this.status = status; }

// …同樣為所有欄位產生 getXxx()/setXxx(...)
public List<String> getCategories() { return categories; }
public void setCategories(List<String> categories) { this.categories = categories; }

public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSince() {
        return since;
    }

    public void setSince(String since) {
        this.since = since;
    }

    public Integer getCertifications() {
        return certifications;
    }

    public void setCertifications(Integer certifications) {
        this.certifications = certifications;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getLatestCertificationName() {
        return latestCertificationName;
    }

    public void setLatestCertificationName(String latestCertificationName) {
        this.latestCertificationName = latestCertificationName;
    }

    public LocalDate getLatestCertificationDate() {
        return latestCertificationDate;
    }

    public void setLatestCertificationDate(LocalDate latestCertificationDate) {
        this.latestCertificationDate = latestCertificationDate;
    }

    public String getExpirationCertificationName() {
        return expirationCertificationName;
    }

    public void setExpirationCertificationName(String expirationCertificationName) {
        this.expirationCertificationName = expirationCertificationName;
    }

    public Integer getDaysLeft() {
        return daysLeft;
    }

    public void setDaysLeft(Integer daysLeft) {
        this.daysLeft = daysLeft;
    }

    public String getOngoingCertificationName() {
        return ongoingCertificationName;
    }

    public void setOngoingCertificationName(String ongoingCertificationName) {
        this.ongoingCertificationName = ongoingCertificationName;
    }

    public Integer getOngoingCertificationProgress() {
        return ongoingCertificationProgress;
    }

    public void setOngoingCertificationProgress(Integer ongoingCertificationProgress) {
        this.ongoingCertificationProgress = ongoingCertificationProgress;
    }

    public String getRiskReason() {
        return riskReason;
    }

    public void setRiskReason(String riskReason) {
        this.riskReason = riskReason;
    }

    public String getActionNeededName() {
        return actionNeededName;
    }

    public void setActionNeededName(String actionNeededName) {
        this.actionNeededName = actionNeededName;
    }

    public Integer getOverdueDays() {
        return overdueDays;
    }

    public void setOverdueDays(Integer overdueDays) {
        this.overdueDays = overdueDays;
    }
}
