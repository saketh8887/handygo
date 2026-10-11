package com.handyconnect.handyman;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "handyman_service_areas", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"handyman_id", "postal_code"})
})
public class HandymanServiceArea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handyman_id", nullable = false)
    private HandymanProfile handyman;

    @Column(name = "postal_code", nullable = false, length = 20)
    private String postalCode;

    @Column(length = 100)
    private String city;

    @Column(name = "area_name", length = 100)
    private String areaName;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public HandymanServiceArea() {}

    public HandymanServiceArea(HandymanProfile handyman, String postalCode, String city, String areaName) {
        this.handyman = handyman;
        this.postalCode = postalCode;
        this.city = city;
        this.areaName = areaName;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public HandymanProfile getHandyman() {
        return handyman;
    }

    public void setHandyman(HandymanProfile handyman) {
        this.handyman = handyman;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
