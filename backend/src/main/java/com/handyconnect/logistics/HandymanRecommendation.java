package com.handyconnect.logistics;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class HandymanRecommendation {
    private Long handymanId;
    private Long userId;
    private String fullName;
    private String profilePhotoUrl;
    private String primarySpecialization;
    private List<String> specializations = new ArrayList<>();
    private BigDecimal matchScore = BigDecimal.ZERO; // 0 to 100
    private String verificationStatus;
    private BigDecimal ratingAvg;
    private Integer ratingCount = 0;
    private Integer experienceYears;
    private Integer completedJobCount = 0;
    private Integer activeWorkload = 0;
    private Integer maxWorkload = 3;

    private boolean isEligible = false;
    private boolean skillsMatch = false;
    private boolean availabilityMatch = false;
    private boolean workloadMatch = false;
    private boolean serviceAreaMatch = false;
    private boolean teamMatch = false;
    private String assignedTeamName;
    private String assignedTeamCode;
    private String teamMembershipStatus;
    private boolean isPrimaryTeam = false;

    private List<String> matchedSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private List<String> matchReasons = new ArrayList<>();
    private List<String> ineligibilityReasons = new ArrayList<>();
    private Map<String, BigDecimal> scoreBreakdown = new LinkedHashMap<>();

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

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getPrimarySpecialization() {
        return primarySpecialization;
    }

    public void setPrimarySpecialization(String primarySpecialization) {
        this.primarySpecialization = primarySpecialization;
    }

    public List<String> getSpecializations() {
        return specializations;
    }

    public void setSpecializations(List<String> specializations) {
        this.specializations = specializations;
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

    public Integer getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(Integer ratingCount) {
        this.ratingCount = ratingCount;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public Integer getCompletedJobCount() {
        return completedJobCount;
    }

    public void setCompletedJobCount(Integer completedJobCount) {
        this.completedJobCount = completedJobCount;
    }

    public Integer getActiveWorkload() {
        return activeWorkload;
    }

    public void setActiveWorkload(Integer activeWorkload) {
        this.activeWorkload = activeWorkload;
    }

    public Integer getMaxWorkload() {
        return maxWorkload;
    }

    public void setMaxWorkload(Integer maxWorkload) {
        this.maxWorkload = maxWorkload;
    }

    public boolean isEligible() {
        return isEligible;
    }

    public void setEligible(boolean eligible) {
        isEligible = eligible;
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

    public boolean isWorkloadMatch() {
        return workloadMatch;
    }

    public void setWorkloadMatch(boolean workloadMatch) {
        this.workloadMatch = workloadMatch;
    }

    public boolean isServiceAreaMatch() {
        return serviceAreaMatch;
    }

    public void setServiceAreaMatch(boolean serviceAreaMatch) {
        this.serviceAreaMatch = serviceAreaMatch;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<String> getMatchReasons() {
        return matchReasons;
    }

    public void setMatchReasons(List<String> matchReasons) {
        this.matchReasons = matchReasons;
    }

    public List<String> getIneligibilityReasons() {
        return ineligibilityReasons;
    }

    public void setIneligibilityReasons(List<String> ineligibilityReasons) {
        this.ineligibilityReasons = ineligibilityReasons;
    }

    public Map<String, BigDecimal> getScoreBreakdown() {
        return scoreBreakdown;
    }

    public void setScoreBreakdown(Map<String, BigDecimal> scoreBreakdown) {
        this.scoreBreakdown = scoreBreakdown;
    }

    public boolean isTeamMatch() {
        return teamMatch;
    }

    public void setTeamMatch(boolean teamMatch) {
        this.teamMatch = teamMatch;
    }

    public String getAssignedTeamName() {
        return assignedTeamName;
    }

    public void setAssignedTeamName(String assignedTeamName) {
        this.assignedTeamName = assignedTeamName;
    }

    public String getAssignedTeamCode() {
        return assignedTeamCode;
    }

    public void setAssignedTeamCode(String assignedTeamCode) {
        this.assignedTeamCode = assignedTeamCode;
    }

    public String getTeamMembershipStatus() {
        return teamMembershipStatus;
    }

    public void setTeamMembershipStatus(String teamMembershipStatus) {
        this.teamMembershipStatus = teamMembershipStatus;
    }

    public boolean isPrimaryTeam() {
        return isPrimaryTeam;
    }

    public void setPrimaryTeam(boolean primaryTeam) {
        isPrimaryTeam = primaryTeam;
    }
}
