package com.handyconnect.booking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class BookingDto {
    private Long id;
    private String bookingReference;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long serviceId;
    private String serviceName;
    private String serviceCategory;
    private Long addressId;
    private String addressLine;
    private String addressCity;
    private BookingStatus status;
    private LocalDate scheduledDate;
    private String scheduledTimeSlot;
    private String problemDescription;
    private String photoUrl;
    private BigDecimal quotationAmount;
    private BigDecimal materialsAmount;
    private BigDecimal finalAmount;
    private String jobReadinessStatus;
    private String readinessNotes;
    private String cancellationReason;
    private String completionNotes;
    private String completionPhotoUrl;
    private LocalDateTime createdAt;

    // Assigned Handyman info if assigned
    private Long assignedHandymanId;
    private String assignedHandymanName;
    private String assignedHandymanPhone;
    private String assignmentStatus;

    // Material list
    private List<BookingMaterialDto> materials;

    // Status History
    private List<BookingStatusHistoryDto> history;

    public BookingDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public String getBookingNumber() {
        return bookingReference;
    }

    public BigDecimal getTotalAmount() {
        return finalAmount != null ? finalAmount : quotationAmount;
    }

    public String getCustomerAddress() {
        if (addressLine == null) return addressCity;
        return addressCity != null ? addressLine + ", " + addressCity : addressLine;
    }

    public String getCategoryName() {
        return serviceCategory;
    }

    public BigDecimal getEstimatedBasePrice() {
        return quotationAmount;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(String serviceCategory) {
        this.serviceCategory = serviceCategory;
    }

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getAddressCity() {
        return addressCity;
    }

    public void setAddressCity(String addressCity) {
        this.addressCity = addressCity;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getScheduledTimeSlot() {
        return scheduledTimeSlot;
    }

    public void setScheduledTimeSlot(String scheduledTimeSlot) {
        this.scheduledTimeSlot = scheduledTimeSlot;
    }

    public String getProblemDescription() {
        return problemDescription;
    }

    public void setProblemDescription(String problemDescription) {
        this.problemDescription = problemDescription;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public BigDecimal getQuotationAmount() {
        return quotationAmount;
    }

    public void setQuotationAmount(BigDecimal quotationAmount) {
        this.quotationAmount = quotationAmount;
    }

    public BigDecimal getMaterialsAmount() {
        return materialsAmount;
    }

    public void setMaterialsAmount(BigDecimal materialsAmount) {
        this.materialsAmount = materialsAmount;
    }

    public BigDecimal getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(BigDecimal finalAmount) {
        this.finalAmount = finalAmount;
    }

    public String getJobReadinessStatus() {
        return jobReadinessStatus;
    }

    public void setJobReadinessStatus(String jobReadinessStatus) {
        this.jobReadinessStatus = jobReadinessStatus;
    }

    public String getReadinessNotes() {
        return readinessNotes;
    }

    public void setReadinessNotes(String readinessNotes) {
        this.readinessNotes = readinessNotes;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getCompletionNotes() {
        return completionNotes;
    }

    public void setCompletionNotes(String completionNotes) {
        this.completionNotes = completionNotes;
    }

    public String getCompletionPhotoUrl() {
        return completionPhotoUrl;
    }

    public void setCompletionPhotoUrl(String completionPhotoUrl) {
        this.completionPhotoUrl = completionPhotoUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getAssignedHandymanId() {
        return assignedHandymanId;
    }

    public void setAssignedHandymanId(Long assignedHandymanId) {
        this.assignedHandymanId = assignedHandymanId;
    }

    public String getAssignedHandymanName() {
        return assignedHandymanName;
    }

    public void setAssignedHandymanName(String assignedHandymanName) {
        this.assignedHandymanName = assignedHandymanName;
    }

    public String getAssignedHandymanPhone() {
        return assignedHandymanPhone;
    }

    public void setAssignedHandymanPhone(String assignedHandymanPhone) {
        this.assignedHandymanPhone = assignedHandymanPhone;
    }

    public String getAssignmentStatus() {
        return assignmentStatus;
    }

    public void setAssignmentStatus(String assignmentStatus) {
        this.assignmentStatus = assignmentStatus;
    }

    public List<BookingMaterialDto> getMaterials() {
        return materials;
    }

    public void setMaterials(List<BookingMaterialDto> materials) {
        this.materials = materials;
    }

    public List<BookingStatusHistoryDto> getHistory() {
        return history;
    }

    public void setHistory(List<BookingStatusHistoryDto> history) {
        this.history = history;
    }

    public static class BookingMaterialDto {
        private Long id;
        private Long itemId;
        private String itemSku;
        private String itemName;
        private Long locationId;
        private String locationName;
        private BigDecimal reservedQty;
        private BigDecimal usedQty;
        private BigDecimal returnedQty;
        private BigDecimal unitPrice;
        private String status;

        public BookingMaterialDto() {}

        public BookingMaterialDto(BookingMaterial bm) {
            this.id = bm.getId();
            if (bm.getItem() != null) {
                this.itemId = bm.getItem().getId();
                this.itemSku = bm.getItem().getSku();
                this.itemName = bm.getItem().getName();
            }
            if (bm.getLocation() != null) {
                this.locationId = bm.getLocation().getId();
                this.locationName = bm.getLocation().getName();
            }
            this.reservedQty = bm.getReservedQty();
            this.usedQty = bm.getUsedQty();
            this.returnedQty = bm.getReturnedQty();
            this.unitPrice = bm.getUnitPrice();
            this.status = bm.getStatus();
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

        public BigDecimal getReservedQty() {
            return reservedQty;
        }

        public void setReservedQty(BigDecimal reservedQty) {
            this.reservedQty = reservedQty;
        }

        public BigDecimal getUsedQty() {
            return usedQty;
        }

        public void setUsedQty(BigDecimal usedQty) {
            this.usedQty = usedQty;
        }

        public BigDecimal getReturnedQty() {
            return returnedQty;
        }

        public void setReturnedQty(BigDecimal returnedQty) {
            this.returnedQty = returnedQty;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class BookingStatusHistoryDto {
        private String fromStatus;
        private String toStatus;
        private String changedByName;
        private String notes;
        private LocalDateTime timestamp;

        public BookingStatusHistoryDto() {}

        public BookingStatusHistoryDto(BookingStatusHistory h) {
            this.fromStatus = h.getFromStatus();
            this.toStatus = h.getToStatus();
            if (h.getChangedBy() != null) {
                this.changedByName = h.getChangedBy().getFullName();
            }
            this.notes = h.getNotes();
            this.timestamp = h.getTimestamp();
        }

        public String getFromStatus() {
            return fromStatus;
        }

        public void setFromStatus(String fromStatus) {
            this.fromStatus = fromStatus;
        }

        public String getToStatus() {
            return toStatus;
        }

        public void setToStatus(String toStatus) {
            this.toStatus = toStatus;
        }

        public String getChangedByName() {
            return changedByName;
        }

        public void setChangedByName(String changedByName) {
            this.changedByName = changedByName;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }
}
