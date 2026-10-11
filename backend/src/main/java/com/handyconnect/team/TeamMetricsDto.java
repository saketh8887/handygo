package com.handyconnect.team;

import java.math.BigDecimal;

public class TeamMetricsDto {
    private Long teamId;
    private String teamName;
    private String teamCode;
    private int totalMembers;
    private int availableMembers;
    private int busyMembers;
    private int onLeaveMembers;
    private int pendingApprovals;
    private int activeJobs;
    private int completedJobs;
    private int pendingBookings;
    private BigDecimal averageRating;
    private double onTimeRatePercent;
    private int averageJobDurationMinutes;

    public TeamMetricsDto() {}

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

    public int getTotalMembers() {
        return totalMembers;
    }

    public void setTotalMembers(int totalMembers) {
        this.totalMembers = totalMembers;
    }

    public int getAvailableMembers() {
        return availableMembers;
    }

    public void setAvailableMembers(int availableMembers) {
        this.availableMembers = availableMembers;
    }

    public int getBusyMembers() {
        return busyMembers;
    }

    public void setBusyMembers(int busyMembers) {
        this.busyMembers = busyMembers;
    }

    public int getOnLeaveMembers() {
        return onLeaveMembers;
    }

    public void setOnLeaveMembers(int onLeaveMembers) {
        this.onLeaveMembers = onLeaveMembers;
    }

    public int getPendingApprovals() {
        return pendingApprovals;
    }

    public void setPendingApprovals(int pendingApprovals) {
        this.pendingApprovals = pendingApprovals;
    }

    public int getActiveJobs() {
        return activeJobs;
    }

    public void setActiveJobs(int activeJobs) {
        this.activeJobs = activeJobs;
    }

    public int getCompletedJobs() {
        return completedJobs;
    }

    public void setCompletedJobs(int completedJobs) {
        this.completedJobs = completedJobs;
    }

    public int getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(int pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(BigDecimal averageRating) {
        this.averageRating = averageRating;
    }

    public double getOnTimeRatePercent() {
        return onTimeRatePercent;
    }

    public void setOnTimeRatePercent(double onTimeRatePercent) {
        this.onTimeRatePercent = onTimeRatePercent;
    }

    public int getAverageJobDurationMinutes() {
        return averageJobDurationMinutes;
    }

    public void setAverageJobDurationMinutes(int averageJobDurationMinutes) {
        this.averageJobDurationMinutes = averageJobDurationMinutes;
    }
}
