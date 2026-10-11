package com.handyconnect.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class BookingRequest {

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Address ID is required")
    private Long addressId;

    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate;

    @NotBlank(message = "Time slot is required")
    private String scheduledTimeSlot; // e.g. "09:00 - 11:00", "13:00 - 15:00"

    @NotBlank(message = "Problem description is required")
    private String problemDescription;

    private String photoUrl;
    private java.util.List<Long> attachmentIds;
    private Long selectedHandymanId;

    public BookingRequest() {}

    public Long getSelectedHandymanId() {
        return selectedHandymanId;
    }

    public void setSelectedHandymanId(Long selectedHandymanId) {
        this.selectedHandymanId = selectedHandymanId;
    }

    public java.util.List<Long> getAttachmentIds() {
        return attachmentIds;
    }

    public void setAttachmentIds(java.util.List<Long> attachmentIds) {
        this.attachmentIds = attachmentIds;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
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
}
