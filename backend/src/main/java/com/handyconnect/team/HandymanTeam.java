package com.handyconnect.team;

import com.handyconnect.handyman.HandymanProfile;
import com.handyconnect.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "handyman_teams", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"handyman_id", "team_id"})
})
public class HandymanTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handyman_id", nullable = false)
    private HandymanProfile handyman;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private ServiceTeam team;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "approval_status", nullable = false, length = 30)
    private String approvalStatus = "APPROVED"; // PENDING, APPROVED, REJECTED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public HandymanTeam() {}

    public HandymanTeam(HandymanProfile handyman, ServiceTeam team, Boolean isPrimary, String approvalStatus) {
        this.handyman = handyman;
        this.team = team;
        this.isPrimary = isPrimary != null ? isPrimary : false;
        this.approvalStatus = approvalStatus != null ? approvalStatus : "APPROVED";
        this.createdAt = LocalDateTime.now();
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

    public ServiceTeam getTeam() {
        return team;
    }

    public void setTeam(ServiceTeam team) {
        this.team = team;
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

    public User getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(User approvedBy) {
        this.approvedBy = approvedBy;
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
