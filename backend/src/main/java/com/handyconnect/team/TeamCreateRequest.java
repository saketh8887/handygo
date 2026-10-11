package com.handyconnect.team;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class TeamCreateRequest {

    @NotBlank(message = "Team name is required")
    private String name;

    @NotBlank(message = "Team code is required")
    private String code;

    private String description;
    private String iconName = "Users";
    private Boolean isActive = true;
    private List<Long> skillIds;

    public TeamCreateRequest() {}

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

    public List<Long> getSkillIds() {
        return skillIds;
    }

    public void setSkillIds(List<Long> skillIds) {
        this.skillIds = skillIds;
    }
}
