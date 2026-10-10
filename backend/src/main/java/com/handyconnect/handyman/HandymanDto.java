package com.handyconnect.handyman;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class HandymanDto {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private String phone;
    private Integer experienceYears;
    private String bio;
    private String serviceAreas;
    private String verificationStatus;
    private LocalDateTime verifiedAt;
    private BigDecimal hourlyRate;
    private BigDecimal serviceRadiusKm;
    private BigDecimal ratingAvg;
    private Integer ratingCount;
    private String activeStatus;
    private List<HandymanSkillDto> skills;
    private List<HandymanAvailabilityDto> availabilities;

    public HandymanDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getServiceAreas() {
        return serviceAreas;
    }

    public void setServiceAreas(String serviceAreas) {
        this.serviceAreas = serviceAreas;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public BigDecimal getServiceRadiusKm() {
        return serviceRadiusKm;
    }

    public void setServiceRadiusKm(BigDecimal serviceRadiusKm) {
        this.serviceRadiusKm = serviceRadiusKm;
    }

    public BigDecimal getRatingAvg() {
        return ratingAvg;
    }

    public void setRatingAvg(BigDecimal ratingAvg) {
        this.ratingAvg = ratingAvg;
    }

    public Integer getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(Integer ratingCount) {
        this.ratingCount = ratingCount;
    }

    public String getActiveStatus() {
        return activeStatus;
    }

    public void setActiveStatus(String activeStatus) {
        this.activeStatus = activeStatus;
    }

    public List<HandymanSkillDto> getSkills() {
        return skills;
    }

    public void setSkills(List<HandymanSkillDto> skills) {
        this.skills = skills;
    }

    public List<HandymanAvailabilityDto> getAvailabilities() {
        return availabilities;
    }

    public void setAvailabilities(List<HandymanAvailabilityDto> availabilities) {
        this.availabilities = availabilities;
    }
}
