package com.handyconnect.servicecatalog;

import java.math.BigDecimal;
import java.util.List;

public class ServiceDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryCode;
    private String name;
    private String code;
    private String description;
    private BigDecimal indicativeBasePrice;
    private Integer estimatedDurationMinutes;
    private String requiredSkills;
    private Boolean isActive;
    private Long teamId;
    private String teamName;
    private String teamCode;
    private String teamIcon;
    private List<ServiceMaterialDto> standardMaterials;
    private List<ServiceRequiredSkillDto> requiredSkillsList;

    public ServiceDto() {}

    public ServiceDto(ServiceEntity entity) {
        this.id = entity.getId();
        if (entity.getCategory() != null) {
            this.categoryId = entity.getCategory().getId();
            this.categoryName = entity.getCategory().getName();
            this.categoryCode = entity.getCategory().getCode();
        }
        if (entity.getTeam() != null) {
            this.teamId = entity.getTeam().getId();
            this.teamName = entity.getTeam().getName();
            this.teamCode = entity.getTeam().getCode();
            this.teamIcon = entity.getTeam().getIconName();
        }
        this.name = entity.getName();
        this.code = entity.getCode();
        this.description = entity.getDescription();
        this.indicativeBasePrice = entity.getIndicativeBasePrice();
        this.estimatedDurationMinutes = entity.getEstimatedDurationMinutes();
        this.requiredSkills = entity.getRequiredSkills();
        this.isActive = entity.getIsActive();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public void setCategoryCode(String categoryCode) {
        this.categoryCode = categoryCode;
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

    public BigDecimal getIndicativeBasePrice() {
        return indicativeBasePrice;
    }

    public BigDecimal getBasePrice() {
        return indicativeBasePrice;
    }

    public void setIndicativeBasePrice(BigDecimal indicativeBasePrice) {
        this.indicativeBasePrice = indicativeBasePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.indicativeBasePrice = basePrice;
    }

    public Integer getEstimatedDurationMinutes() {
        return estimatedDurationMinutes;
    }

    public void setEstimatedDurationMinutes(Integer estimatedDurationMinutes) {
        this.estimatedDurationMinutes = estimatedDurationMinutes;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public List<ServiceMaterialDto> getStandardMaterials() {
        return standardMaterials;
    }

    public void setStandardMaterials(List<ServiceMaterialDto> standardMaterials) {
        this.standardMaterials = standardMaterials;
    }

    public List<ServiceRequiredSkillDto> getRequiredSkillsList() {
        return requiredSkillsList;
    }

    public void setRequiredSkillsList(List<ServiceRequiredSkillDto> requiredSkillsList) {
        this.requiredSkillsList = requiredSkillsList;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getTeamCode() {
        return teamCode;
    }

    public void setTeamCode(String teamCode) {
        this.teamCode = teamCode;
    }

    public String getTeamIcon() {
        return teamIcon;
    }

    public void setTeamIcon(String teamIcon) {
        this.teamIcon = teamIcon;
    }
}
