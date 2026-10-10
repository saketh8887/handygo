package com.handyconnect.handyman;

import com.handyconnect.servicecatalog.ServiceCategory;
import jakarta.persistence.*;

@Entity
@Table(name = "handyman_skills")
public class HandymanSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handyman_id", nullable = false)
    private HandymanProfile handyman;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ServiceCategory category;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(name = "certification_details", length = 255)
    private String certificationDetails;

    @Column(name = "years_experience")
    private Integer yearsExperience = 1;

    public HandymanSkill() {}

    public HandymanSkill(HandymanProfile handyman, ServiceCategory category, String skillName, String certificationDetails, Integer yearsExperience) {
        this.handyman = handyman;
        this.category = category;
        this.skillName = skillName;
        this.certificationDetails = certificationDetails;
        this.yearsExperience = yearsExperience;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public HandymanProfile getHandyman() {
        return handyman;
    }

    public void setHandyman(HandymanProfile handyman) {
        this.handyman = handyman;
    }

    public ServiceCategory getCategory() {
        return category;
    }

    public void setCategory(ServiceCategory category) {
        this.category = category;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getCertificationDetails() {
        return certificationDetails;
    }

    public void setCertificationDetails(String certificationDetails) {
        this.certificationDetails = certificationDetails;
    }

    public Integer getYearsExperience() {
        return yearsExperience;
    }

    public void setYearsExperience(Integer yearsExperience) {
        this.yearsExperience = yearsExperience;
    }
}
