package com.handyconnect.booking;

import java.time.LocalDateTime;

public class AttachmentDto {
    private Long id;
    private Long bookingId;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String url;
    private LocalDateTime createdAt;

    public AttachmentDto() {}

    public AttachmentDto(BookingAttachment entity) {
        this.id = entity.getId();
        if (entity.getBooking() != null) {
            this.bookingId = entity.getBooking().getId();
        }
        this.originalFilename = entity.getOriginalFilename();
        this.contentType = entity.getContentType();
        this.fileSize = entity.getFileSize();
        this.url = "/api/v1/attachments/" + entity.getId();
        this.createdAt = entity.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
