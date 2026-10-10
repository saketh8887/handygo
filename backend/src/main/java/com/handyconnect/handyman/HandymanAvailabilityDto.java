package com.handyconnect.handyman;

import java.time.LocalTime;

public class HandymanAvailabilityDto {
    private Long id;
    private Long handymanId;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isActive;

    public HandymanAvailabilityDto() {}

    public HandymanAvailabilityDto(HandymanAvailability a) {
        this.id = a.getId();
        if (a.getHandyman() != null) this.handymanId = a.getHandyman().getId();
        this.dayOfWeek = a.getDayOfWeek();
        this.startTime = a.getStartTime();
        this.endTime = a.getEndTime();
        this.isActive = a.getIsActive();
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

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
