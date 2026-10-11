package com.handyconnect.handyman;

import com.handyconnect.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "handyman_profiles")
public class HandymanProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "experience_years")
    private Integer experienceYears = 0;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;

    @Column(name = "service_areas", length = 255)
    private String serviceAreas;

    @Column(name = "verification_status", nullable = false, length = 50)
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_user_id")
    private User verifiedBy;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate = BigDecimal.ZERO;

    @Column(name = "service_radius_km", precision = 6, scale = 2)
    private BigDecimal serviceRadiusKm = new BigDecimal("25.00");

    @Column(name = "rating_avg", precision = 3, scale = 2)
    private BigDecimal ratingAvg = new BigDecimal("5.00");

    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    @Column(name = "max_active_workload", nullable = false)
    private Integer maxActiveWorkload = 3;

    @Column(name = "availability_status", nullable = false, length = 30)
    private String availabilityStatus = "AVAILABLE"; // AVAILABLE, BUSY, ON_LEAVE, INACTIVE

    @Column(name = "completed_job_count", nullable = false)
    private Integer completedJobCount = 0;

    @Column(name = "active_status", length = 30)
    private String activeStatus = "ACTIVE"; // ACTIVE, INACTIVE

    @OneToMany(mappedBy = "handyman", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HandymanSpecialization> specializations = new ArrayList<>();

    @OneToMany(mappedBy = "handyman", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HandymanCertification> certifications = new ArrayList<>();

    @OneToMany(mappedBy = "handyman", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HandymanServiceArea> serviceAreaList = new ArrayList<>();

    @OneToMany(mappedBy = "handyman", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HandymanSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "handyman", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HandymanAvailability> availabilities = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public HandymanProfile() {}

    public HandymanProfile(User user) {
        this.user = user;
        this.verificationStatus = "PENDING";
        this.ratingAvg = new BigDecimal("5.00");
        this.ratingCount = 0;
        this.maxActiveWorkload = 3;
        this.availabilityStatus = "AVAILABLE";
        this.completedJobCount = 0;
        this.activeStatus = "ACTIVE";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (verificationStatus == null) verificationStatus = "PENDING";
        if (activeStatus == null) activeStatus = "ACTIVE";
        if (availabilityStatus == null) availabilityStatus = "AVAILABLE";
        if (maxActiveWorkload == null) maxActiveWorkload = 3;
        if (completedJobCount == null) completedJobCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getServiceAreas() {
        return serviceAreas;
    }

    public void setServiceAreas(String serviceAreas) {
        this.serviceAreas = serviceAreas;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public User getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(User verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public BigDecimal getServiceRadiusKm() {
        return serviceRadiusKm;
    }

    public void setServiceRadiusKm(BigDecimal serviceRadiusKm) {
        this.serviceRadiusKm = serviceRadiusKm;
    }

    public BigDecimal getRatingAvg() {
        return ratingAvg;
    }

    public void setRatingAvg(BigDecimal ratingAvg) {
        this.ratingAvg = ratingAvg;
    }

    public Integer getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(Integer ratingCount) {
        this.ratingCount = ratingCount;
    }

    public Integer getMaxActiveWorkload() {
        return maxActiveWorkload;
    }

    public void setMaxActiveWorkload(Integer maxActiveWorkload) {
        this.maxActiveWorkload = maxActiveWorkload;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public Integer getCompletedJobCount() {
        return completedJobCount;
    }

    public void setCompletedJobCount(Integer completedJobCount) {
        this.completedJobCount = completedJobCount;
    }

    public String getActiveStatus() {
        return activeStatus;
    }

    public void setActiveStatus(String activeStatus) {
        this.activeStatus = activeStatus;
    }

    public List<HandymanSpecialization> getSpecializations() {
        return specializations;
    }

    public void setSpecializations(List<HandymanSpecialization> specializations) {
        this.specializations = specializations;
    }

    public List<HandymanCertification> getCertifications() {
        return certifications;
    }

    public void setCertifications(List<HandymanCertification> certifications) {
        this.certifications = certifications;
    }

    public List<HandymanServiceArea> getServiceAreaList() {
        return serviceAreaList;
    }

    public void setServiceAreaList(List<HandymanServiceArea> serviceAreaList) {
        this.serviceAreaList = serviceAreaList;
    }

    public List<HandymanSkill> getSkills() {
        return skills;
    }

    public void setSkills(List<HandymanSkill> skills) {
        this.skills = skills;
    }

    public List<HandymanAvailability> getAvailabilities() {
        return availabilities;
    }

    public void setAvailabilities(List<HandymanAvailability> availabilities) {
        this.availabilities = availabilities;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
