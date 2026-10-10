package com.handyconnect.inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InventoryMovementDto {
    private Long id;
    private Long itemId;
    private String itemSku;
    private String itemName;
    private Long locationId;
    private String locationName;
    private String movementType;
    private BigDecimal quantity;
    private BigDecimal balanceAfter;
    private String referenceType;
    private String referenceId;
    private String reason;
    private String performedByName;
    private LocalDateTime timestamp;

    public InventoryMovementDto() {}

    public InventoryMovementDto(InventoryMovement m) {
        this.id = m.getId();
        if (m.getItem() != null) {
            this.itemId = m.getItem().getId();
            this.itemSku = m.getItem().getSku();
            this.itemName = m.getItem().getName();
        }
        if (m.getLocation() != null) {
            this.locationId = m.getLocation().getId();
            this.locationName = m.getLocation().getName();
        }
        this.movementType = m.getMovementType();
        this.quantity = m.getQuantity();
        this.balanceAfter = m.getBalanceAfter();
        this.referenceType = m.getReferenceType();
        this.referenceId = m.getReferenceId();
        this.reason = m.getReason();
        if (m.getPerformedBy() != null) {
            this.performedByName = m.getPerformedBy().getFullName();
        }
        this.timestamp = m.getTimestamp();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getItemSku() {
        return itemSku;
    }

    public void setItemSku(String itemSku) {
        this.itemSku = itemSku;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public String getMovementType() {
        return movementType;
    }

    public void setMovementType(String movementType) {
        this.movementType = movementType;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(BigDecimal balanceAfter) {
        this.balanceAfter = balanceAfter;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getPerformedByName() {
        return performedByName;
    }

    public void setPerformedByName(String performedByName) {
        this.performedByName = performedByName;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
