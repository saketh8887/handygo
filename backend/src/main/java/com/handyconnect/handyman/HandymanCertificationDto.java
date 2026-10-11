package com.handyconnect.handyman;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class HandymanCertificationDto {
    private Long id;
    private Long handymanId;
    private String title;
    private String issuingOrganization;
    private String certificateNumber;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String verificationStatus;
    private String verificationNotes;
    private LocalDateTime verifiedAt;

    public HandymanCertificationDto() {}

    public HandymanCertificationDto(HandymanCertification cert) {
        if (cert != null) {
            this.id = cert.getId();
            if (cert.getHandyman() != null) {
                this.handymanId = cert.getHandyman().getId();
            }
            this.title = cert.getTitle();
            this.issuingOrganization = cert.getIssuingOrganization();
            this.certificateNumber = cert.getCertificateNumber();
            this.issueDate = cert.getIssueDate();
            this.expiryDate = cert.getExpiryDate();
            this.verificationStatus = cert.getVerificationStatus();
            this.verificationNotes = cert.getVerificationNotes();
            this.verifiedAt = cert.getVerifiedAt();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHandymanId() {
        return handymanId;
    }

    public void setHandymanId(Long handymanId) {
        this.handymanId = handymanId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIssuingOrganization() {
        return issuingOrganization;
    }

    public void setIssuingOrganization(String issuingOrganization) {
        this.issuingOrganization = issuingOrganization;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getVerificationNotes() {
        return verificationNotes;
    }

    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
