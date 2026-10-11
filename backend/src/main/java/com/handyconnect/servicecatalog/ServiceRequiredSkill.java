package com.handyconnect.servicecatalog;

import com.handyconnect.handyman.Skill;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_required_skills", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"service_id", "skill_id"})
})
public class ServiceRequiredSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "is_mandatory", nullable = false)
    private Boolean isMandatory = true;

    @Column(name = "min_proficiency", length = 30)
    private String minProficiency = "INTERMEDIATE"; // BEGINNER, INTERMEDIATE, EXPERT, MASTER

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ServiceRequiredSkill() {}

    public ServiceRequiredSkill(ServiceEntity service, Skill skill, Boolean isMandatory, String minProficiency) {
        this.service = service;
        this.skill = skill;
        this.isMandatory = isMandatory != null ? isMandatory : true;
        this.minProficiency = minProficiency != null ? minProficiency : "INTERMEDIATE";
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (isMandatory == null) isMandatory = true;
        if (minProficiency == null) minProficiency = "INTERMEDIATE";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ServiceEntity getService() {
        return service;
    }

    public void setService(ServiceEntity service) {
        this.service = service;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public Boolean getIsMandatory() {
        return isMandatory;
    }

    public void setIsMandatory(Boolean mandatory) {
        isMandatory = mandatory;
    }

    public String getMinProficiency() {
        return minProficiency;
    }

    public void setMinProficiency(String minProficiency) {
        this.minProficiency = minProficiency;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
