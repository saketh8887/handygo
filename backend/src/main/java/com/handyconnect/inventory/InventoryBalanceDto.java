package com.handyconnect.inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InventoryBalanceDto {
    private Long id;
    private Long itemId;
    private String itemSku;
    private String itemName;
    private String unitOfMeasure;
    private Long locationId;
    private String locationCode;
    private String locationName;
    private BigDecimal quantityOnHand;
    private BigDecimal reservedQuantity;
    private BigDecimal availableQuantity;
    private BigDecimal reorderLevel;
    private boolean isLowStock;
    private LocalDateTime updatedAt;

    public InventoryBalanceDto() {}

    public InventoryBalanceDto(InventoryBalance b) {
        this.id = b.getId();
        if (b.getItem() != null) {
            this.itemId = b.getItem().getId();
            this.itemSku = b.getItem().getSku();
            this.itemName = b.getItem().getName();
            this.unitOfMeasure = b.getItem().getUnitOfMeasure();
            this.reorderLevel = b.getItem().getReorderLevel();
        }
        if (b.getLocation() != null) {
            this.locationId = b.getLocation().getId();
            this.locationCode = b.getLocation().getCode();
            this.locationName = b.getLocation().getName();
        }
        this.quantityOnHand = b.getQuantityOnHand();
        this.reservedQuantity = b.getReservedQuantity();
        this.availableQuantity = b.getAvailableQuantity();
        this.isLowStock = this.reorderLevel != null && this.availableQuantity.compareTo(this.reorderLevel) <= 0;
        this.updatedAt = b.getUpdatedAt();
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

    public String getUnitOfMeasure() {
        return unitOfMeasure;
    }

    public void setUnitOfMeasure(String unitOfMeasure) {
        this.unitOfMeasure = unitOfMeasure;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public String getLocationCode() {
        return locationCode;
    }

    public void setLocationCode(String locationCode) {
        this.locationCode = locationCode;
    }

    public String locationName() {
        return locationName;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public BigDecimal getQuantityOnHand() {
        return quantityOnHand;
    }

    public void setQuantityOnHand(BigDecimal quantityOnHand) {
        this.quantityOnHand = quantityOnHand;
    }

    public BigDecimal getReservedQuantity() {
        return reservedQuantity;
    }

    public void setReservedQuantity(BigDecimal reservedQuantity) {
        this.reservedQuantity = reservedQuantity;
    }

    public BigDecimal getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(BigDecimal availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public BigDecimal getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(BigDecimal reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public boolean isLowStock() {
        return isLowStock;
    }

    public void setLowStock(boolean lowStock) {
        isLowStock = lowStock;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
