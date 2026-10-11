package com.handyconnect.servicecatalog;

import java.util.ArrayList;
import java.util.List;

public class ServiceCategoryDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String iconName;
    private Boolean isActive;
    private Integer displayOrder;

    // Enhanced metrics & example services
    private Long qualifiedHandymenCount = 0L;
    private Long servicesCount = 0L;
    private List<String> exampleServices = new ArrayList<>();
    private Long pendingBookingsCount = 0L;
    private Long completedBookingsCount = 0L;

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

    public Long getQualifiedHandymenCount() {
        return qualifiedHandymenCount;
    }

    public void setQualifiedHandymenCount(Long qualifiedHandymenCount) {
        this.qualifiedHandymenCount = qualifiedHandymenCount;
    }

    public Long getServicesCount() {
        return servicesCount;
    }

    public void setServicesCount(Long servicesCount) {
        this.servicesCount = servicesCount;
    }

    public List<String> getExampleServices() {
        return exampleServices;
    }

    public void setExampleServices(List<String> exampleServices) {
        this.exampleServices = exampleServices;
    }

    public Long getPendingBookingsCount() {
        return pendingBookingsCount;
    }

    public void setPendingBookingsCount(Long pendingBookingsCount) {
        this.pendingBookingsCount = pendingBookingsCount;
    }

    public Long getCompletedBookingsCount() {
        return completedBookingsCount;
    }

    public void setCompletedBookingsCount(Long completedBookingsCount) {
        this.completedBookingsCount = completedBookingsCount;
    }
}
