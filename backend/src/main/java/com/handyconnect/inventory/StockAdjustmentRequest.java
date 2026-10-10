package com.handyconnect.inventory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class StockAdjustmentRequest {

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotNull(message = "Adjustment quantity is required")
    @DecimalMin(value = "0.00", message = "Quantity on hand cannot be negative")
    private BigDecimal newQuantityOnHand;

    @NotBlank(message = "Adjustment reason is mandatory")
    private String reason;

    private String referenceId;

    public StockAdjustmentRequest() {}

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public BigDecimal getNewQuantityOnHand() {
        return newQuantityOnHand;
    }

    public void setNewQuantityOnHand(BigDecimal newQuantityOnHand) {
        this.newQuantityOnHand = newQuantityOnHand;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }
}
