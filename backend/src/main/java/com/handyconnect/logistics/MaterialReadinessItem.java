package com.handyconnect.logistics;

import java.math.BigDecimal;

public class MaterialReadinessItem {
    private Long itemId;
    private String sku;
    private String name;
    private BigDecimal requiredQuantity;
    private BigDecimal availableInPrimaryLocation;
    private BigDecimal totalNetworkAvailable;
    private Long recommendedLocationId;
    private String recommendedLocationName;
    private String fulfillmentStrategy; // LOCAL_RESERVE, TRANSFER, SUPPLIER_REPLENISH, SHORTAGE_BLOCKED
    private String explanation;

    public MaterialReadinessItem() {}

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getRequiredQuantity() {
        return requiredQuantity;
    }

    public void setRequiredQuantity(BigDecimal requiredQuantity) {
        this.requiredQuantity = requiredQuantity;
    }

    public BigDecimal getAvailableInPrimaryLocation() {
        return availableInPrimaryLocation;
    }

    public void setAvailableInPrimaryLocation(BigDecimal availableInPrimaryLocation) {
        this.availableInPrimaryLocation = availableInPrimaryLocation;
    }

    public BigDecimal getTotalNetworkAvailable() {
        return totalNetworkAvailable;
    }

    public void setTotalNetworkAvailable(BigDecimal totalNetworkAvailable) {
        this.totalNetworkAvailable = totalNetworkAvailable;
    }

    public Long getRecommendedLocationId() {
        return recommendedLocationId;
    }

    public void setRecommendedLocationId(Long recommendedLocationId) {
        this.recommendedLocationId = recommendedLocationId;
    }

    public String getRecommendedLocationName() {
        return recommendedLocationName;
    }

    public void setRecommendedLocationName(String recommendedLocationName) {
        this.recommendedLocationName = recommendedLocationName;
    }

    public String getFulfillmentStrategy() {
        return fulfillmentStrategy;
    }

    public void setFulfillmentStrategy(String fulfillmentStrategy) {
        this.fulfillmentStrategy = fulfillmentStrategy;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
