package com.handyconnect.handyman;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "handyman_specializations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"handyman_id", "specialization_id"})
})
public class HandymanSpecialization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handyman_id", nullable = false)
    private HandymanProfile handyman;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "specialization_id", nullable = false)
    private Specialization specialization;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "years_experience")
    private Integer yearsExperience = 1;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public HandymanSpecialization() {}

    public HandymanSpecialization(HandymanProfile handyman, Specialization specialization, Boolean isPrimary, Integer yearsExperience) {
        this.handyman = handyman;
        this.specialization = specialization;
        this.isPrimary = isPrimary != null ? isPrimary : false;
        this.yearsExperience = yearsExperience != null ? yearsExperience : 1;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (isPrimary == null) isPrimary = false;
        if (yearsExperience == null) yearsExperience = 1;
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

    public Specialization getSpecialization() {
        return specialization;
    }

    public void setSpecialization(Specialization specialization) {
        this.specialization = specialization;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean primary) {
        isPrimary = primary;
    }

    public Integer getYearsExperience() {
        return yearsExperience;
    }

    public void setYearsExperience(Integer yearsExperience) {
        this.yearsExperience = yearsExperience;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
