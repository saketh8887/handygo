package com.handyconnect.procurement;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ProcurementDto {

    public static class RequisitionDto {
        private Long id;
        private String requisitionNumber;
        private Long itemId;
        private String itemSku;
        private String itemName;
        private Long locationId;
        private String locationName;
        private BigDecimal suggestedQuantity;
        private String reason;
        private String status;
        private String createdByName;
        private LocalDateTime createdAt;

        public RequisitionDto() {}

        public RequisitionDto(PurchaseRequisition r) {
            this.id = r.getId();
            this.requisitionNumber = r.getRequisitionNumber();
            if (r.getItem() != null) {
                this.itemId = r.getItem().getId();
                this.itemSku = r.getItem().getSku();
                this.itemName = r.getItem().getName();
            }
            if (r.getLocation() != null) {
                this.locationId = r.getLocation().getId();
                this.locationName = r.getLocation().getName();
            }
            this.suggestedQuantity = r.getSuggestedQuantity();
            this.reason = r.getReason();
            this.status = r.getStatus();
            if (r.getCreatedBy() != null) {
                this.createdByName = r.getCreatedBy().getFullName();
            }
            this.createdAt = r.getCreatedAt();
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getRequisitionNumber() { return requisitionNumber; }
        public void setRequisitionNumber(String requisitionNumber) { this.requisitionNumber = requisitionNumber; }
        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }
        public String getItemSku() { return itemSku; }
        public void setItemSku(String itemSku) { this.itemSku = itemSku; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public Long getLocationId() { return locationId; }
        public void setLocationId(Long locationId) { this.locationId = locationId; }
        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }
        public BigDecimal getSuggestedQuantity() { return suggestedQuantity; }
        public void setSuggestedQuantity(BigDecimal suggestedQuantity) { this.suggestedQuantity = suggestedQuantity; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCreatedByName() { return createdByName; }
        public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class PurchaseOrderDto {
        private Long id;
        private String poNumber;
        private Long supplierId;
        private String supplierName;
        private Long destinationLocationId;
        private String destinationLocationName;
        private String status;
        private BigDecimal totalAmount;
        private LocalDate expectedDeliveryDate;
        private LocalDate actualDeliveryDate;
        private LocalDateTime createdAt;
        private List<POItemDto> items;

        public PurchaseOrderDto() {}

        public PurchaseOrderDto(PurchaseOrder po) {
            this.id = po.getId();
            this.poNumber = po.getPoNumber();
            if (po.getSupplier() != null) {
                this.supplierId = po.getSupplier().getId();
                this.supplierName = po.getSupplier().getCompanyName();
            }
            if (po.getDestinationLocation() != null) {
                this.destinationLocationId = po.getDestinationLocation().getId();
                this.destinationLocationName = po.getDestinationLocation().getName();
            }
            this.status = po.getStatus();
            this.totalAmount = po.getTotalAmount();
            this.expectedDeliveryDate = po.getExpectedDeliveryDate();
            this.actualDeliveryDate = po.getActualDeliveryDate();
            this.createdAt = po.getCreatedAt();
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getPoNumber() { return poNumber; }
        public void setPoNumber(String poNumber) { this.poNumber = poNumber; }
        public Long getSupplierId() { return supplierId; }
        public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
        public String getSupplierName() { return supplierName; }
        public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
        public Long getDestinationLocationId() { return destinationLocationId; }
        public void setDestinationLocationId(Long destinationLocationId) { this.destinationLocationId = destinationLocationId; }
        public String getDestinationLocationName() { return destinationLocationName; }
        public void setDestinationLocationName(String destinationLocationName) { this.destinationLocationName = destinationLocationName; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
        public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
        public LocalDate getActualDeliveryDate() { return actualDeliveryDate; }
        public void setActualDeliveryDate(LocalDate actualDeliveryDate) { this.actualDeliveryDate = actualDeliveryDate; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public List<POItemDto> getItems() { return items; }
        public void setItems(List<POItemDto> items) { this.items = items; }
    }

    public static class POItemDto {
        private Long id;
        private Long itemId;
        private String itemSku;
        private String itemName;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private BigDecimal receivedQuantity;

        public POItemDto() {}

        public POItemDto(PurchaseOrderItem item) {
            this.id = item.getId();
            if (item.getItem() != null) {
                this.itemId = item.getItem().getId();
                this.itemSku = item.getItem().getSku();
                this.itemName = item.getItem().getName();
            }
            this.quantity = item.getQuantity();
            this.unitPrice = item.getUnitPrice();
            this.receivedQuantity = item.getReceivedQuantity();
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }
        public String getItemSku() { return itemSku; }
        public void setItemSku(String itemSku) { this.itemSku = itemSku; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public BigDecimal getReceivedQuantity() { return receivedQuantity; }
        public void setReceivedQuantity(BigDecimal receivedQuantity) { this.receivedQuantity = receivedQuantity; }
    }

    public static class StockTransferDto {
        private Long id;
        private String transferNumber;
        private Long itemId;
        private String itemSku;
        private String itemName;
        private Long fromLocationId;
        private String fromLocationName;
        private Long toLocationId;
        private String toLocationName;
        private BigDecimal quantity;
        private String status;
        private String reason;
        private BigDecimal estimatedCost;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;

        public StockTransferDto() {}

        public StockTransferDto(StockTransfer st) {
            this.id = st.getId();
            this.transferNumber = st.getTransferNumber();
            if (st.getItem() != null) {
                this.itemId = st.getItem().getId();
                this.itemSku = st.getItem().getSku();
                this.itemName = st.getItem().getName();
            }
            if (st.getFromLocation() != null) {
                this.fromLocationId = st.getFromLocation().getId();
                this.fromLocationName = st.getFromLocation().getName();
            }
            if (st.getToLocation() != null) {
                this.toLocationId = st.getToLocation().getId();
                this.toLocationName = st.getToLocation().getName();
            }
            this.quantity = st.getQuantity();
            this.status = st.getStatus();
            this.reason = st.getReason();
            this.estimatedCost = st.getEstimatedCost();
            this.createdAt = st.getCreatedAt();
            this.completedAt = st.getCompletedAt();
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTransferNumber() { return transferNumber; }
        public void setTransferNumber(String transferNumber) { this.transferNumber = transferNumber; }
        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }
        public String getItemSku() { return itemSku; }
        public void setItemSku(String itemSku) { this.itemSku = itemSku; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public Long getFromLocationId() { return fromLocationId; }
        public void setFromLocationId(Long fromLocationId) { this.fromLocationId = fromLocationId; }
        public String getFromLocationName() { return fromLocationName; }
        public void setFromLocationName(String fromLocationName) { this.fromLocationName = fromLocationName; }
        public Long getToLocationId() { return toLocationId; }
        public void setToLocationId(Long toLocationId) { this.toLocationId = toLocationId; }
        public String getToLocationName() { return toLocationName; }
        public void setToLocationName(String toLocationName) { this.toLocationName = toLocationName; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public BigDecimal getEstimatedCost() { return estimatedCost; }
        public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    }

    public static class ReorderRecommendationDto {
        private Long itemId;
        private String itemSku;
        private String itemName;
        private BigDecimal currentStock;
        private BigDecimal reservedStock;
        private BigDecimal availableStock;
        private BigDecimal safetyStock;
        private Integer supplierLeadTimeDays;
        private BigDecimal averageDailyDemand;
        private BigDecimal reorderPoint;
        private BigDecimal recommendedOrderQuantity;
        private String explanation;
        private boolean transferPossible;
        private Long transferSourceLocationId;
        private String transferSourceLocationName;

        public ReorderRecommendationDto() {}

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }
        public String getItemSku() { return itemSku; }
        public void setItemSku(String itemSku) { this.itemSku = itemSku; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public BigDecimal getCurrentStock() { return currentStock; }
        public void setCurrentStock(BigDecimal currentStock) { this.currentStock = currentStock; }
        public BigDecimal getReservedStock() { return reservedStock; }
        public void setReservedStock(BigDecimal reservedStock) { this.reservedStock = reservedStock; }
        public BigDecimal getAvailableStock() { return availableStock; }
        public void setAvailableStock(BigDecimal availableStock) { this.availableStock = availableStock; }
        public BigDecimal getSafetyStock() { return safetyStock; }
        public void setSafetyStock(BigDecimal safetyStock) { this.safetyStock = safetyStock; }
        public Integer getSupplierLeadTimeDays() { return supplierLeadTimeDays; }
        public void setSupplierLeadTimeDays(Integer supplierLeadTimeDays) { this.supplierLeadTimeDays = supplierLeadTimeDays; }
        public BigDecimal getAverageDailyDemand() { return averageDailyDemand; }
        public void setAverageDailyDemand(BigDecimal averageDailyDemand) { this.averageDailyDemand = averageDailyDemand; }
        public BigDecimal getReorderPoint() { return reorderPoint; }
        public void setReorderPoint(BigDecimal reorderPoint) { this.reorderPoint = reorderPoint; }
        public BigDecimal getRecommendedOrderQuantity() { return recommendedOrderQuantity; }
        public void setRecommendedOrderQuantity(BigDecimal recommendedOrderQuantity) { this.recommendedOrderQuantity = recommendedOrderQuantity; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
        public boolean isTransferPossible() { return transferPossible; }
        public void setTransferPossible(boolean transferPossible) { this.transferPossible = transferPossible; }
        public Long getTransferSourceLocationId() { return transferSourceLocationId; }
        public void setTransferSourceLocationId(Long transferSourceLocationId) { this.transferSourceLocationId = transferSourceLocationId; }
        public String getTransferSourceLocationName() { return transferSourceLocationName; }
        public void setTransferSourceLocationName(String transferSourceLocationName) { this.transferSourceLocationName = transferSourceLocationName; }
    }
}
