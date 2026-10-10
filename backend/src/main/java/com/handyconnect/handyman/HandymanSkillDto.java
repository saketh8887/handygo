package com.handyconnect.handyman;

public class HandymanSkillDto {
    private Long id;
    private Long handymanId;
    private Long categoryId;
    private String categoryName;
    private String skillName;
    private String certificationDetails;
    private Integer yearsExperience;

    public HandymanSkillDto() {}

    public HandymanSkillDto(HandymanSkill s) {
        this.id = s.getId();
        if (s.getHandyman() != null) this.handymanId = s.getHandyman().getId();
        if (s.getCategory() != null) {
            this.categoryId = s.getCategory().getId();
            this.categoryName = s.getCategory().getName();
        }
        this.skillName = s.getSkillName();
        this.certificationDetails = s.getCertificationDetails();
        this.yearsExperience = s.getYearsExperience();
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
