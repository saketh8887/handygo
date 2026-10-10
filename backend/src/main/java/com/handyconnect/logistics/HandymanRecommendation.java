package com.handyconnect.logistics;

import java.math.BigDecimal;
import java.util.List;

public class HandymanRecommendation {
    private Long handymanId;
    private Long userId;
    private String fullName;
    private BigDecimal matchScore; // 0 to 100
    private String verificationStatus;
    private BigDecimal ratingAvg;
    private Integer experienceYears;
    private boolean skillsMatch;
    private boolean availabilityMatch;
    private List<String> matchReasons;

    public HandymanRecommendation() {}

    public Long getHandymanId() {
        return handymanId;
    }

    public void setHandymanId(Long handymanId) {
        this.handymanId = handymanId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public BigDecimal getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(BigDecimal matchScore) {
        this.matchScore = matchScore;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public BigDecimal getRatingAvg() {
        return ratingAvg;
    }

    public void setRatingAvg(BigDecimal ratingAvg) {
        this.ratingAvg = ratingAvg;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public boolean isSkillsMatch() {
        return skillsMatch;
    }

    public void setSkillsMatch(boolean skillsMatch) {
        this.skillsMatch = skillsMatch;
    }

    public boolean isAvailabilityMatch() {
        return availabilityMatch;
    }

    public void setAvailabilityMatch(boolean availabilityMatch) {
        this.availabilityMatch = availabilityMatch;
    }

    public List<String> getMatchReasons() {
        return matchReasons;
    }

    public void setMatchReasons(List<String> matchReasons) {
        this.matchReasons = matchReasons;
    }
}
