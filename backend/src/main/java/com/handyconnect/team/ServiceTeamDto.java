package com.handyconnect.team;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ServiceTeamDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String iconName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private int memberCount = 0;
    private int approvedMemberCount = 0;
    private int pendingMemberCount = 0;
    private int activeJobsCount = 0;
    private int completedJobsCount = 0;
    private BigDecimal averageRating = BigDecimal.valueOf(4.8);

    private List<TeamSkillDto> skills = new ArrayList<>();
    private List<HandymanTeamDto> members = new ArrayList<>();

    public ServiceTeamDto() {}

    public ServiceTeamDto(ServiceTeam entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.code = entity.getCode();
        this.description = entity.getDescription();
        this.iconName = entity.getIconName();
        this.isActive = entity.getIsActive();
        this.createdAt = entity.getCreatedAt();
        this.updatedAt = entity.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIconName() {
        return iconName;
    }

    public void setIconName(String iconName) {
        this.iconName = iconName;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }

    public int getApprovedMemberCount() {
        return approvedMemberCount;
    }

    public void setApprovedMemberCount(int approvedMemberCount) {
        this.approvedMemberCount = approvedMemberCount;
    }

    public int getPendingMemberCount() {
        return pendingMemberCount;
    }

    public void setPendingMemberCount(int pendingMemberCount) {
        this.pendingMemberCount = pendingMemberCount;
    }

    public int getActiveJobsCount() {
        return activeJobsCount;
    }

    public void setActiveJobsCount(int activeJobsCount) {
        this.activeJobsCount = activeJobsCount;
    }

    public int getCompletedJobsCount() {
        return completedJobsCount;
    }

    public void setCompletedJobsCount(int completedJobsCount) {
        this.completedJobsCount = completedJobsCount;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(BigDecimal averageRating) {
        this.averageRating = averageRating;
    }

    public List<TeamSkillDto> getSkills() {
        return skills;
    }

    public void setSkills(List<TeamSkillDto> skills) {
        this.skills = skills;
    }

    public List<HandymanTeamDto> getMembers() {
        return members;
    }

    public void setMembers(List<HandymanTeamDto> members) {
        this.members = members;
    }
}
