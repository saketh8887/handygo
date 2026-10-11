package com.handyconnect.handyman;

public class HandymanSpecializationDto {
    private Long id;
    private Long specializationId;
    private String specializationName;
    private String specializationCode;
    private String iconName;
    private Boolean isPrimary;
    private Integer yearsExperience;

    public HandymanSpecializationDto() {}

    public HandymanSpecializationDto(HandymanSpecialization hs) {
        if (hs != null) {
            this.id = hs.getId();
            if (hs.getSpecialization() != null) {
                this.specializationId = hs.getSpecialization().getId();
                this.specializationName = hs.getSpecialization().getName();
                this.specializationCode = hs.getSpecialization().getCode();
                this.iconName = hs.getSpecialization().getIconName();
            }
            this.isPrimary = hs.getIsPrimary();
            this.yearsExperience = hs.getYearsExperience();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSpecializationId() {
        return specializationId;
    }

    public void setSpecializationId(Long specializationId) {
        this.specializationId = specializationId;
    }

    public String getSpecializationName() {
        return specializationName;
    }

    public void setSpecializationName(String specializationName) {
        this.specializationName = specializationName;
    }

    public String getSpecializationCode() {
        return specializationCode;
    }

    public void setSpecializationCode(String specializationCode) {
        this.specializationCode = specializationCode;
    }

    public String getIconName() {
        return iconName;
    }

    public void setIconName(String iconName) {
        this.iconName = iconName;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean primary) {
        isPrimary = primary;
    }

    public Integer getYearsExperience() {
        return yearsExperience;
    }

    public void setYearsExperience(Integer yearsExperience) {
        this.yearsExperience = yearsExperience;
    }
}
