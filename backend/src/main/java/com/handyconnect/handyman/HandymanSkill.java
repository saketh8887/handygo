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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(name = "proficiency_level", length = 30)
    private String proficiencyLevel = "INTERMEDIATE"; // BEGINNER, INTERMEDIATE, EXPERT, MASTER

    @Column(name = "certification_details", length = 255)
    private String certificationDetails;

    @Column(name = "years_experience")
    private Integer yearsExperience = 1;

    @Column(name = "is_verified")
    private Boolean isVerified = true;

    public HandymanSkill() {}

    public HandymanSkill(HandymanProfile handyman, ServiceCategory category, String skillName, String certificationDetails, Integer yearsExperience) {
        this.handyman = handyman;
        this.category = category;
        this.skillName = skillName;
        this.certificationDetails = certificationDetails;
        this.yearsExperience = yearsExperience != null ? yearsExperience : 1;
        this.proficiencyLevel = "INTERMEDIATE";
        this.isVerified = true;
    }

    public HandymanSkill(HandymanProfile handyman, ServiceCategory category, Skill skill, String skillName, String proficiencyLevel, String certificationDetails, Integer yearsExperience) {
        this.handyman = handyman;
        this.category = category;
        this.skill = skill;
        this.skillName = skillName;
        this.proficiencyLevel = proficiencyLevel != null ? proficiencyLevel : "INTERMEDIATE";
        this.certificationDetails = certificationDetails;
        this.yearsExperience = yearsExperience != null ? yearsExperience : 1;
        this.isVerified = true;
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

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getProficiencyLevel() {
        return proficiencyLevel;
    }

    public void setProficiencyLevel(String proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
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

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean verified) {
        isVerified = verified;
    }
}
