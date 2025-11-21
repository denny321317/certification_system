package com.project.backend.model;

import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import jakarta.persistence.*;

import lombok.*;




@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String type;  // 指供應商類別

    @Column
    private String product;  // 指供應的原料

    @Column(nullable = false)
    private String country;

    @Column
    private String address;

    @Column
    private String telephone;

    @Column
    private String email;

    @Column
    private Date collabStart;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "supplier_common_certs",
        joinColumns = @JoinColumn(name = "supplier_id")
    )
    @Column(name = "cert_name", length = 128, nullable = false)
    private Set<String> commonCerts = new HashSet<>();

    public Set<String> getCommonCerts() {
        return commonCerts;
    }

    public void setCommonCerts(Set<String> commonCerts) {
        this.commonCerts = commonCerts;
    }


    public enum CertificateStatus {
        CERTIFICATED,
        UNDER_CERTIFICATION,
        NOT_CERTIFICATED
    }
    @Enumerated(EnumType.STRING)
    @Column
    private CertificateStatus certificateStatus;


    public enum RiskProfile {
        HIGH,
        MEDIUM,
        LOW
    }
    @Enumerated(EnumType.STRING)
    @Column
    private RiskProfile riskProfile;
    

    @ManyToMany
    @JoinTable(
        name = "project_supplier",
        joinColumns = @JoinColumn(name = "supplier_id"),
        inverseJoinColumns = @JoinColumn(name = "project_id")
    )
    private List<Project> projects;


    
    /*
     * Getters and Setters below
     */
    public Long getId() {
        return id;
    }
    
    public void setId(long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }

    /**
     * This function returns the ISO 3166-1 Code for countries.
     * <eg> TW for Taiwan, US for USA
     * @return
     */
    public String getCountry() {
        return country;
    }

    /**
     * @param country This should be in ISO 3166-1 Code. 
     * <eg> TW for Taiwan, CN for China, VN for Vietnam
     */
    public void setCountry(String country) {
        this.country = country;
    }
    
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getProduct() {
        return product;
    }

    public void setProduct(String product) {
        this.product = product;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Date getCollabStart() {
        return collabStart;
    }

    public void setCollabStart(Date collabStart) {
        this.collabStart = collabStart;
    }

    public CertificateStatus getCertificateStatus() {
        return certificateStatus;
    }

    public void setCertificateStatus(CertificateStatus certificateStatus) {
        this.certificateStatus = certificateStatus;
    }

    public RiskProfile getRiskProfile() {
        return riskProfile;
    }

    public void setRiskProfile(RiskProfile riskProfile) {
        this.riskProfile = riskProfile;
    }

    public List<Project> getProjects() {
        return projects;
    }



    
}
