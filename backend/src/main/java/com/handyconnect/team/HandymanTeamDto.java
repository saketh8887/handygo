package com.handyconnect.team;

import java.time.LocalDateTime;

public class HandymanTeamDto {
    private Long id;
    private Long handymanId;
    private Long teamId;
    private String teamName;
    private String teamCode;
    private String teamIcon;
    private Boolean isPrimary = false;
    private String approvalStatus = "APPROVED"; // PENDING, APPROVED, REJECTED
    private Long approvedByUserId;
    private String approvedByUserName;
    private LocalDateTime approvedAt;
    private String notes;
    private LocalDateTime createdAt;

    public HandymanTeamDto() {}

    public HandymanTeamDto(HandymanTeam entity) {
        this.id = entity.getId();
        if (entity.getHandyman() != null) {
            this.handymanId = entity.getHandyman().getId();
        }
        if (entity.getTeam() != null) {
            this.teamId = entity.getTeam().getId();
            this.teamName = entity.getTeam().getName();
            this.teamCode = entity.getTeam().getCode();
            this.teamIcon = entity.getTeam().getIconName();
        }
        this.isPrimary = entity.getIsPrimary();
        this.approvalStatus = entity.getApprovalStatus();
        if (entity.getApprovedBy() != null) {
            this.approvedByUserId = entity.getApprovedBy().getId();
            this.approvedByUserName = entity.getApprovedBy().getFullName();
        }
        this.approvedAt = entity.getApprovedAt();
        this.notes = entity.getNotes();
        this.createdAt = entity.getCreatedAt();
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

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getTeamCode() {
        return teamCode;
    }

    public void setTeamCode(String teamCode) {
        this.teamCode = teamCode;
    }

    public String getTeamIcon() {
        return teamIcon;
    }

    public void setTeamIcon(String teamIcon) {
        this.teamIcon = teamIcon;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean primary) {
        isPrimary = primary;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public Long getApprovedByUserId() {
        return approvedByUserId;
    }

    public void setApprovedByUserId(Long approvedByUserId) {
        this.approvedByUserId = approvedByUserId;
    }

    public String getApprovedByUserName() {
        return approvedByUserName;
    }

    public void setApprovedByUserName(String approvedByUserName) {
        this.approvedByUserName = approvedByUserName;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
