package com.project.backend.dto;

import java.util.Date;
import java.util.List;

import com.project.backend.model.Supplier.CertificateStatus;
import com.project.backend.model.Supplier.RiskProfile;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
@JsonIgnoreProperties(ignoreUnknown = true)
public class SupplierDTO {
    private Long id;
    private String name;
    private String type;
    private String product;
    private String country;
    private String address;
    private String telephone;
    private String email;
    private Date collabStart;
    private CertificateStatus certificateStatus;
    private RiskProfile riskProfile;
    private List<ProjectDetailDTO> projects;
    @JsonProperty("commonCerts")
    private List<String> commonCerts;

    @JsonProperty("otherCertification")
    private String otherCertification;


    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Date getCollabStart() { return collabStart; }
    public void setCollabStart(Date collabStart) { this.collabStart = collabStart; }

    public CertificateStatus getCertificateStatus() { return certificateStatus; }
    public void setCertificateStatus(CertificateStatus certificateStatus) { this.certificateStatus = certificateStatus; }

    public RiskProfile getRiskProfile() { return riskProfile; }
    public void setRiskProfile(RiskProfile riskProfile) { this.riskProfile = riskProfile; }

    public List<ProjectDetailDTO> getProjects() { return projects; }
    public void setProjects(List<ProjectDetailDTO> projects) { this.projects = projects; }
        public List<String> getCommonCerts() {
        return commonCerts;
    }

    public void setCommonCerts(List<String> commonCerts) {
        this.commonCerts = commonCerts;
    }

    public String getOtherCertification() {
        return otherCertification;
    }

    public void setOtherCertification(String otherCertification) {
        this.otherCertification = otherCertification;
    }

}