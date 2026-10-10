package com.handyconnect.complaint;

import java.time.LocalDateTime;

public class ComplaintDto {
    private Long id;
    private String complaintReference;
    private Long bookingId;
    private String bookingReference;
    private Long customerId;
    private String customerName;
    private String category;
    private String description;
    private String status;
    private String resolutionNotes;
    private String resolvedByName;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public ComplaintDto() {}

    public ComplaintDto(Complaint c) {
        this.id = c.getId();
        this.complaintReference = c.getComplaintReference();
        if (c.getBooking() != null) {
            this.bookingId = c.getBooking().getId();
            this.bookingReference = c.getBooking().getBookingReference();
        }
        if (c.getCustomer() != null) {
            this.customerId = c.getCustomer().getId();
            this.customerName = c.getCustomer().getFullName();
        }
        this.category = c.getCategory();
        this.description = c.getDescription();
        this.status = c.getStatus();
        this.resolutionNotes = c.getResolutionNotes();
        if (c.getResolvedBy() != null) {
            this.resolvedByName = c.getResolvedBy().getFullName();
        }
        this.createdAt = c.getCreatedAt();
        this.resolvedAt = c.getResolvedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getComplaintReference() {
        return complaintReference;
    }

    public void setComplaintReference(String complaintReference) {
        this.complaintReference = complaintReference;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getBookingReference() {
        return bookingReference;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getResolvedByName() {
        return resolvedByName;
    }

    public void setResolvedByName(String resolvedByName) {
        this.resolvedByName = resolvedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
