package com.handyconnect.handyman;

public class SkillDto {
    private Long id;
    private Long specializationId;
    private String specializationName;
    private String name;
    private String code;
    private String description;
    private Boolean isActive;

    public SkillDto() {}

    public SkillDto(Skill skill) {
        if (skill != null) {
            this.id = skill.getId();
            if (skill.getSpecialization() != null) {
                this.specializationId = skill.getSpecialization().getId();
                this.specializationName = skill.getSpecialization().getName();
            }
            this.name = skill.getName();
            this.code = skill.getCode();
            this.description = skill.getDescription();
            this.isActive = skill.getIsActive();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSpecializationId() {
        return specializationId;
    }

    public void setSpecializationId(Long specializationId) {
        this.specializationId = specializationId;
    }

    public String getSpecializationName() {
        return specializationName;
    }

    public void setSpecializationName(String specializationName) {
        this.specializationName = specializationName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }
}
