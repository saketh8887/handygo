package com.handyconnect.invoice;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InvoiceDto {
    private Long id;
    private String invoiceNumber;
    private Long bookingId;
    private String bookingReference;
    private Long customerId;
    private String customerName;
    private BigDecimal baseServiceAmount;
    private BigDecimal materialsAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime issuedAt;
    private LocalDateTime paidAt;

    public InvoiceDto() {}

    public InvoiceDto(Invoice inv) {
        this.id = inv.getId();
        this.invoiceNumber = inv.getInvoiceNumber();
        if (inv.getBooking() != null) {
            this.bookingId = inv.getBooking().getId();
            this.bookingReference = inv.getBooking().getBookingReference();
        }
        if (inv.getCustomer() != null) {
            this.customerId = inv.getCustomer().getId();
            this.customerName = inv.getCustomer().getFullName();
        }
        this.baseServiceAmount = inv.getBaseServiceAmount();
        this.materialsAmount = inv.getMaterialsAmount();
        this.taxAmount = inv.getTaxAmount();
        this.totalAmount = inv.getTotalAmount();
        this.status = inv.getStatus();
        this.issuedAt = inv.getIssuedAt();
        this.paidAt = inv.getPaidAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
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

    public BigDecimal getBaseServiceAmount() {
        return baseServiceAmount;
    }

    public void setBaseServiceAmount(BigDecimal baseServiceAmount) {
        this.baseServiceAmount = baseServiceAmount;
    }

    public BigDecimal getMaterialsAmount() {
        return materialsAmount;
    }

    public void setMaterialsAmount(BigDecimal materialsAmount) {
        this.materialsAmount = materialsAmount;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}
