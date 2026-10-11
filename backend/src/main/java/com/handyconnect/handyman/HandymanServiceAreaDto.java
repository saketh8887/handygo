package com.handyconnect.handyman;

public class HandymanServiceAreaDto {
    private Long id;
    private Long handymanId;
    private String postalCode;
    private String city;
    private String areaName;
    private Boolean isActive;

    public HandymanServiceAreaDto() {}

    public HandymanServiceAreaDto(HandymanServiceArea area) {
        if (area != null) {
            this.id = area.getId();
            if (area.getHandyman() != null) {
                this.handymanId = area.getHandyman().getId();
            }
            this.postalCode = area.getPostalCode();
            this.city = area.getCity();
            this.areaName = area.getAreaName();
            this.isActive = area.getIsActive();
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
}
