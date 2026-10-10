package com.handyconnect.inventory;

import java.math.BigDecimal;

public class InventoryItemDto {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private String category;
    private String unitOfMeasure;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal reorderLevel;
    private BigDecimal safetyStock;
    private Boolean isActive;
    private BigDecimal totalOnHand;
    private BigDecimal totalReserved;
    private BigDecimal totalAvailable;

    public InventoryItemDto() {}

    public InventoryItemDto(InventoryItem item) {
        this.id = item.getId();
        this.sku = item.getSku();
        this.name = item.getName();
        this.description = item.getDescription();
        this.category = item.getCategory();
        this.unitOfMeasure = item.getUnitOfMeasure();
        this.costPrice = item.getCostPrice();
        this.sellingPrice = item.getSellingPrice();
        this.reorderLevel = item.getReorderLevel();
        this.safetyStock = item.getSafetyStock();
        this.isActive = item.getIsActive();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getUnitOfMeasure() {
        return unitOfMeasure;
    }

    public void setUnitOfMeasure(String unitOfMeasure) {
        this.unitOfMeasure = unitOfMeasure;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(BigDecimal sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public BigDecimal getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(BigDecimal reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public BigDecimal getSafetyStock() {
        return safetyStock;
    }

    public void setSafetyStock(BigDecimal safetyStock) {
        this.safetyStock = safetyStock;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public BigDecimal getTotalOnHand() {
        return totalOnHand;
    }

    public void setTotalOnHand(BigDecimal totalOnHand) {
        this.totalOnHand = totalOnHand;
    }

    public BigDecimal getTotalReserved() {
        return totalReserved;
    }

    public void setTotalReserved(BigDecimal totalReserved) {
        this.totalReserved = totalReserved;
    }

    public BigDecimal getTotalAvailable() {
        return totalAvailable;
    }

    public void setTotalAvailable(BigDecimal totalAvailable) {
        this.totalAvailable = totalAvailable;
    }
}
