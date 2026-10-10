package com.handyconnect.logistics;

import java.math.BigDecimal;
import java.util.List;

public class JobReadinessEvaluation {
    private JobReadinessStatus readinessStatus;
    private BigDecimal readinessScore; // 0 to 100
    private String summary;
    private List<String> reasons;
    private List<String> recommendations;
    private List<MaterialReadinessItem> materialReadiness;
    private List<HandymanRecommendation> eligibleHandymen;

    public JobReadinessEvaluation() {}

    public JobReadinessStatus getReadinessStatus() {
        return readinessStatus;
    }

    public void setReadinessStatus(JobReadinessStatus readinessStatus) {
        this.readinessStatus = readinessStatus;
    }

    public BigDecimal getReadinessScore() {
        return readinessScore;
    }

    public void setReadinessScore(BigDecimal readinessScore) {
        this.readinessScore = readinessScore;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public List<MaterialReadinessItem> getMaterialReadiness() {
        return materialReadiness;
    }

    public void setMaterialReadiness(List<MaterialReadinessItem> materialReadiness) {
        this.materialReadiness = materialReadiness;
    }

    public List<HandymanRecommendation> getEligibleHandymen() {
        return eligibleHandymen;
    }

    public void setEligibleHandymen(List<HandymanRecommendation> eligibleHandymen) {
        this.eligibleHandymen = eligibleHandymen;
    }
}
