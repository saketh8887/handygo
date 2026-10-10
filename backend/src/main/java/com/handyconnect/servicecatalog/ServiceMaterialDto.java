package com.handyconnect.servicecatalog;

import java.math.BigDecimal;

public class ServiceMaterialDto {
    private Long id;
    private Long itemId;
    private String itemSku;
    private String itemName;
    private String unitOfMeasure;
    private BigDecimal standardQuantity;
    private BigDecimal unitPrice;
    private Boolean isMandatory;
    private String notes;

    public ServiceMaterialDto() {}

    public ServiceMaterialDto(ServiceMaterial sm) {
        this.id = sm.getId();
        if (sm.getItem() != null) {
            this.itemId = sm.getItem().getId();
            this.itemSku = sm.getItem().getSku();
            this.itemName = sm.getItem().getName();
            this.unitOfMeasure = sm.getItem().getUnitOfMeasure();
            this.unitPrice = sm.getItem().getSellingPrice();
        }
        this.standardQuantity = sm.getStandardQuantity();
        this.isMandatory = sm.getIsMandatory();
        this.notes = sm.getNotes();
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

    public BigDecimal getStandardQuantity() {
        return standardQuantity;
    }

    public void setStandardQuantity(BigDecimal standardQuantity) {
        this.standardQuantity = standardQuantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Boolean getIsMandatory() {
        return isMandatory;
    }

    public void setIsMandatory(Boolean isMandatory) {
        this.isMandatory = isMandatory;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
