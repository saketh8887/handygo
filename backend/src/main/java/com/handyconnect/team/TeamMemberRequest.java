package com.handyconnect.team;

import jakarta.validation.constraints.NotNull;

public class TeamMemberRequest {

    @NotNull(message = "Handyman ID is required")
    private Long handymanId;

    private Boolean isPrimary = false;
    private String approvalStatus = "APPROVED"; // PENDING, APPROVED, REJECTED
    private String notes;

    public TeamMemberRequest() {}

    public Long getHandymanId() {
        return handymanId;
    }

    public void setHandymanId(Long handymanId) {
        this.handymanId = handymanId;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
