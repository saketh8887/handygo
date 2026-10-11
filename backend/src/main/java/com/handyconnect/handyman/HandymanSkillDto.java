package com.handyconnect.handyman;

public class HandymanSkillDto {
    private Long id;
    private Long handymanId;
    private Long categoryId;
    private String categoryName;
    private Long skillId;
    private String skillName;
    private String proficiencyLevel; // BEGINNER, INTERMEDIATE, EXPERT, MASTER
    private String certificationDetails;
    private Integer yearsExperience;
    private Boolean isVerified;

    public HandymanSkillDto() {}

    public HandymanSkillDto(HandymanSkill s) {
        if (s != null) {
            this.id = s.getId();
            if (s.getHandyman() != null) this.handymanId = s.getHandyman().getId();
            if (s.getCategory() != null) {
                this.categoryId = s.getCategory().getId();
                this.categoryName = s.getCategory().getName();
            }
            if (s.getSkill() != null) {
                this.skillId = s.getSkill().getId();
            }
            this.skillName = s.getSkillName();
            this.proficiencyLevel = s.getProficiencyLevel();
            this.certificationDetails = s.getCertificationDetails();
            this.yearsExperience = s.getYearsExperience();
            this.isVerified = s.getIsVerified();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHandymanId() {
        return handymanId;
    }

    public void setHandymanId(Long handymanId) {
        this.handymanId = handymanId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
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
