package com.handyconnect.servicecatalog;

public class ServiceCategoryDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String iconName;
    private Boolean isActive;
    private Integer displayOrder;

    public ServiceCategoryDto() {}

    public ServiceCategoryDto(ServiceCategory cat) {
        this.id = cat.getId();
        this.name = cat.getName();
        this.code = cat.getCode();
        this.description = cat.getDescription();
        this.iconName = cat.getIconName();
        this.isActive = cat.getIsActive();
        this.displayOrder = cat.getDisplayOrder();
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

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
