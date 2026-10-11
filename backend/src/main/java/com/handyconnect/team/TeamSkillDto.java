package com.handyconnect.team;

import com.handyconnect.handyman.SkillDto;

public class TeamSkillDto {
    private Long id;
    private Long teamId;
    private Long skillId;
    private String skillName;
    private String skillCode;
    private String skillDescription;

    public TeamSkillDto() {}

    public TeamSkillDto(TeamSkill entity) {
        this.id = entity.getId();
        if (entity.getTeam() != null) {
            this.teamId = entity.getTeam().getId();
        }
        if (entity.getSkill() != null) {
            this.skillId = entity.getSkill().getId();
            this.skillName = entity.getSkill().getName();
            this.skillCode = entity.getSkill().getCode();
            this.skillDescription = entity.getSkill().getDescription();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getSkillCode() {
        return skillCode;
    }

    public void setSkillCode(String skillCode) {
        this.skillCode = skillCode;
    }

    public String getSkillDescription() {
        return skillDescription;
    }

    public void setSkillDescription(String skillDescription) {
        this.skillDescription = skillDescription;
    }
}
