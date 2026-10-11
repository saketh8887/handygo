package com.handyconnect.handyman;

public class SpecializationDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String iconName;
    private Boolean isActive;
    private Integer skillsCount;

    public SpecializationDto() {}

    public SpecializationDto(Specialization spec) {
        if (spec != null) {
            this.id = spec.getId();
            this.name = spec.getName();
            this.code = spec.getCode();
            this.description = spec.getDescription();
            this.iconName = spec.getIconName();
            this.isActive = spec.getIsActive();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getIconName() {
        return iconName;
    }

    public void setIconName(String iconName) {
        this.iconName = iconName;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public Integer getSkillsCount() {
        return skillsCount;
    }

    public void setSkillsCount(Integer skillsCount) {
        this.skillsCount = skillsCount;
    }
}
