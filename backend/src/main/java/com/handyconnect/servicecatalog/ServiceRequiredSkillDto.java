package com.handyconnect.servicecatalog;

public class ServiceRequiredSkillDto {
    private Long id;
    private Long serviceId;
    private Long skillId;
    private String skillName;
    private String skillCode;
    private String specializationName;
    private Boolean isMandatory;
    private String minProficiency;

    public ServiceRequiredSkillDto() {}

    public ServiceRequiredSkillDto(ServiceRequiredSkill srs) {
        if (srs != null) {
            this.id = srs.getId();
            if (srs.getService() != null) {
                this.serviceId = srs.getService().getId();
            }
            if (srs.getSkill() != null) {
                this.skillId = srs.getSkill().getId();
                this.skillName = srs.getSkill().getName();
                this.skillCode = srs.getSkill().getCode();
                if (srs.getSkill().getSpecialization() != null) {
                    this.specializationName = srs.getSkill().getSpecialization().getName();
                }
            }
            this.isMandatory = srs.getIsMandatory();
            this.minProficiency = srs.getMinProficiency();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
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

    public String getSpecializationName() {
        return specializationName;
    }

    public void setSpecializationName(String specializationName) {
        this.specializationName = specializationName;
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
}
