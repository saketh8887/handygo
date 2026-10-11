package com.handyconnect.handyman;

import com.handyconnect.common.exception.BadRequestException;
import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.servicecatalog.ServiceCategory;
import com.handyconnect.servicecatalog.ServiceCategoryRepository;
import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HandymanService {

    private final HandymanProfileRepository profileRepository;
    private final HandymanSkillRepository skillRepository;
    private final HandymanAvailabilityRepository availabilityRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final SpecializationRepository specializationRepository;
    private final SkillRepository catalogSkillRepository;
    private final HandymanSpecializationRepository handymanSpecializationRepository;
    private final HandymanCertificationRepository certificationRepository;
    private final HandymanServiceAreaRepository serviceAreaRepository;
    private final com.handyconnect.team.HandymanTeamRepository handymanTeamRepository;

    public HandymanService(HandymanProfileRepository profileRepository,
                           HandymanSkillRepository skillRepository,
                           HandymanAvailabilityRepository availabilityRepository,
                           ServiceCategoryRepository categoryRepository,
                           UserRepository userRepository,
                           SpecializationRepository specializationRepository,
                           SkillRepository catalogSkillRepository,
                           HandymanSpecializationRepository handymanSpecializationRepository,
                           HandymanCertificationRepository certificationRepository,
                           HandymanServiceAreaRepository serviceAreaRepository,
                           com.handyconnect.team.HandymanTeamRepository handymanTeamRepository) {
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.availabilityRepository = availabilityRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.specializationRepository = specializationRepository;
        this.catalogSkillRepository = catalogSkillRepository;
        this.handymanSpecializationRepository = handymanSpecializationRepository;
        this.certificationRepository = certificationRepository;
        this.serviceAreaRepository = serviceAreaRepository;
        this.handymanTeamRepository = handymanTeamRepository;
    }

    @Transactional(readOnly = true)
    public HandymanDto getProfileByUserId(Long userId) {
        HandymanProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "userId", userId));
        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public HandymanDto getProfileById(Long id) {
        HandymanProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "id", id));
        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public List<HandymanDto> getAllHandymen() {
        return profileRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public HandymanDto updateProfile(Long userId, HandymanDto dto) {
        HandymanProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "userId", userId));

        User user = profile.getUser();
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        userRepository.save(user);

        if (dto.getExperienceYears() != null) profile.setExperienceYears(dto.getExperienceYears());
        if (dto.getBio() != null) profile.setBio(dto.getBio());
        if (dto.getProfilePhotoUrl() != null) profile.setProfilePhotoUrl(dto.getProfilePhotoUrl());
        if (dto.getServiceAreas() != null) profile.setServiceAreas(dto.getServiceAreas());
        if (dto.getHourlyRate() != null) profile.setHourlyRate(dto.getHourlyRate());
        if (dto.getServiceRadiusKm() != null) profile.setServiceRadiusKm(dto.getServiceRadiusKm());
        if (dto.getActiveStatus() != null) profile.setActiveStatus(dto.getActiveStatus());
        if (dto.getAvailabilityStatus() != null) profile.setAvailabilityStatus(dto.getAvailabilityStatus());
        if (dto.getMaxActiveWorkload() != null) profile.setMaxActiveWorkload(dto.getMaxActiveWorkload());

        return mapToDto(profileRepository.save(profile));
    }

    // --- Specializations & Catalog Skills ---

    @Transactional(readOnly = true)
    public List<SpecializationDto> getAllSpecializations() {
        return specializationRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(s -> {
                    SpecializationDto dto = new SpecializationDto(s);
                    dto.setSkillsCount(catalogSkillRepository.findBySpecializationIdAndIsActiveTrueOrderByNameAsc(s.getId()).size());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public SpecializationDto createSpecialization(SpecializationDto dto) {
        Specialization spec = new Specialization(dto.getName(), dto.getCode(), dto.getDescription(), dto.getIconName());
        return new SpecializationDto(specializationRepository.save(spec));
    }

    @Transactional(readOnly = true)
    public List<SkillDto> getAllSkills() {
        return catalogSkillRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(SkillDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SkillDto> getSkillsBySpecialization(Long specId) {
        return catalogSkillRepository.findBySpecializationIdAndIsActiveTrueOrderByNameAsc(specId).stream()
                .map(SkillDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public SkillDto createSkill(SkillDto dto) {
        Specialization spec = specializationRepository.findById(dto.getSpecializationId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialization", "id", dto.getSpecializationId()));
        Skill skill = new Skill(spec, dto.getName(), dto.getCode(), dto.getDescription());
        return new SkillDto(catalogSkillRepository.save(skill));
    }

    // --- Handyman Specializations ---

    @Transactional
    public List<HandymanSpecializationDto> updateHandymanSpecializations(Long userId, List<HandymanSpecializationDto> specs) {
        HandymanProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "userId", userId));

        handymanSpecializationRepository.deleteByHandymanId(profile.getId());

        List<HandymanSpecialization> toSave = new ArrayList<>();
        if (specs != null) {
            for (HandymanSpecializationDto d : specs) {
                Specialization spec = specializationRepository.findById(d.getSpecializationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Specialization", "id", d.getSpecializationId()));
                toSave.add(new HandymanSpecialization(profile, spec, d.getIsPrimary(), d.getYearsExperience()));
            }
        }
        return handymanSpecializationRepository.saveAll(toSave).stream()
                .map(HandymanSpecializationDto::new)
                .collect(Collectors.toList());
    }

    // --- Handyman Certifications ---

    @Transactional(readOnly = true)
    public List<HandymanCertificationDto> getCertifications(Long handymanId) {
        return certificationRepository.findByHandymanId(handymanId).stream()
                .map(HandymanCertificationDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public HandymanCertificationDto addCertification(Long userId, HandymanCertificationDto dto) {
        HandymanProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "userId", userId));

        HandymanCertification cert = new HandymanCertification(
                profile,
                dto.getTitle(),
                dto.getIssuingOrganization(),
                dto.getCertificateNumber(),
                dto.getIssueDate(),
                dto.getExpiryDate()
        );
        cert.setVerificationStatus("PENDING");
        return new HandymanCertificationDto(certificationRepository.save(cert));
    }

    @Transactional
    public void deleteCertification(Long userId, Long certId) {
        HandymanProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "userId", userId));
        HandymanCertification cert = certificationRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanCertification", "id", certId));
        if (!cert.getHandyman().getId().equals(profile.getId())) {
            throw new SecurityException("Certification does not belong to user");
        }
        certificationRepository.delete(cert);
    }

    @Transactional
    public HandymanCertificationDto verifyCertification(Long certId, boolean approved, String notes, Long adminUserId) {
        HandymanCertification cert = certificationRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanCertification", "id", certId));
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminUserId));

        cert.setVerificationStatus(approved ? "VERIFIED" : "REJECTED");
        cert.setVerificationNotes(notes);
        cert.setVerifiedAt(LocalDateTime.now());
        cert.setVerifiedBy(admin);

        return new HandymanCertificationDto(certificationRepository.save(cert));
    }

    // --- Handyman Service Areas ---

    @Transactional(readOnly = true)
    public List<HandymanServiceAreaDto> getServiceAreas(Long handymanId) {
        return serviceAreaRepository.findByHandymanId(handymanId).stream()
                .map(HandymanServiceAreaDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<HandymanServiceAreaDto> updateServiceAreas(Long userId, List<HandymanServiceAreaDto> areas) {
        HandymanProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "userId", userId));

        serviceAreaRepository.deleteByHandymanId(profile.getId());

        List<HandymanServiceArea> toSave = new ArrayList<>();
        if (areas != null) {
            for (HandymanServiceAreaDto a : areas) {
                toSave.add(new HandymanServiceArea(profile, a.getPostalCode(), a.getCity(), a.getAreaName()));
            }
        }
        return serviceAreaRepository.saveAll(toSave).stream()
                .map(HandymanServiceAreaDto::new)
                .collect(Collectors.toList());
    }

    // --- Handyman Skills ---

    @Transactional
    public HandymanSkillDto addSkill(Long userId, HandymanSkillDto dto) {
        HandymanProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "userId", userId));

        ServiceCategory category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        }

        Skill skill = null;
        if (dto.getSkillId() != null) {
            skill = catalogSkillRepository.findById(dto.getSkillId()).orElse(null);
            if (skill != null && category == null && skill.getSpecialization() != null) {
                // Infer category from specialization if needed
                category = categoryRepository.findAll().stream().findFirst().orElse(null);
            }
        }

        HandymanSkill entity = new HandymanSkill();
        entity.setHandyman(profile);
        entity.setCategory(category != null ? category : categoryRepository.findAll().get(0));
        entity.setSkill(skill);
        entity.setSkillName(dto.getSkillName() != null ? dto.getSkillName() : (skill != null ? skill.getName() : "General Skill"));
        entity.setProficiencyLevel(dto.getProficiencyLevel() != null ? dto.getProficiencyLevel() : "INTERMEDIATE");
        entity.setCertificationDetails(dto.getCertificationDetails());
        entity.setYearsExperience(dto.getYearsExperience() != null ? dto.getYearsExperience() : 1);
        entity.setIsVerified(true);

        return new HandymanSkillDto(skillRepository.save(entity));
    }

    @Transactional
    public void deleteSkill(Long userId, Long skillId) {
        HandymanProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "userId", userId));
        HandymanSkill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanSkill", "id", skillId));
        if (!skill.getHandyman().getId().equals(profile.getId())) {
            throw new SecurityException("Skill does not belong to user");
        }
        skillRepository.delete(skill);
    }

    @Transactional
    public List<HandymanAvailabilityDto> updateAvailabilities(Long userId, List<HandymanAvailabilityDto> availabilities) {
        HandymanProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "userId", userId));

        List<HandymanAvailability> existing = availabilityRepository.findByHandymanId(profile.getId());
        availabilityRepository.deleteAll(existing);

        List<HandymanAvailability> newItems = availabilities.stream()
                .map(a -> new HandymanAvailability(profile, a.getDayOfWeek().toUpperCase(), a.getStartTime(), a.getEndTime(), a.getIsActive()))
                .collect(Collectors.toList());

        return availabilityRepository.saveAll(newItems).stream()
                .map(HandymanAvailabilityDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public HandymanDto verifyHandyman(Long handymanId, boolean approved, Long adminUserId) {
        HandymanProfile profile = profileRepository.findById(handymanId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "id", handymanId));

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminUserId));

        profile.setVerificationStatus(approved ? "VERIFIED" : "REJECTED");
        profile.setVerifiedAt(approved ? LocalDateTime.now() : null);
        profile.setVerifiedBy(approved ? admin : null);

        return mapToDto(profileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public List<HandymanDto> getHandymenByCategoryId(Long categoryId) {
        ServiceCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory", "id", categoryId));

        Set<Long> matchedHandymanIds = new HashSet<>();

        // 1. Direct skills match
        List<HandymanSkill> skills = skillRepository.findByCategoryId(categoryId);
        for (HandymanSkill hs : skills) {
            if (hs.getHandyman() != null) {
                matchedHandymanIds.add(hs.getHandyman().getId());
            }
        }

        // 2. Specializations match
        String catCode = category.getCode() != null ? category.getCode().toUpperCase() : "";
        String catName = category.getName() != null ? category.getName().toLowerCase() : "";
        List<Specialization> allSpecs = specializationRepository.findAll();
        Set<Long> matchingSpecIds = allSpecs.stream()
                .filter(spec -> {
                    String sCode = spec.getCode() != null ? spec.getCode().toUpperCase() : "";
                    String sName = spec.getName() != null ? spec.getName().toLowerCase() : "";
                    return sCode.contains(catCode) || catCode.contains(sCode)
                            || sName.contains(catName) || catName.contains(sName)
                            || (catName.contains("plumb") && sName.contains("plumb"))
                            || (catName.contains("elect") && sName.contains("elect"))
                            || (catName.contains("carp") && sName.contains("carp"))
                            || (catName.contains("paint") && sName.contains("paint"))
                            || (catName.contains("hvac") && (sName.contains("hvac") || sName.contains("air") || sName.contains("appl")))
                            || (catName.contains("appl") && (sName.contains("appl") || sName.contains("hvac")))
                            || (catName.contains("gen") && sName.contains("gen"));
                })
                .map(Specialization::getId)
                .collect(Collectors.toSet());

        if (!matchingSpecIds.isEmpty()) {
            List<HandymanSpecialization> hSpecs = handymanSpecializationRepository.findBySpecializationIdIn(matchingSpecIds);
            for (HandymanSpecialization hs : hSpecs) {
                if (hs.getHandyman() != null) {
                    matchedHandymanIds.add(hs.getHandyman().getId());
                }
            }
        }

        // 3. Approved Department/Team memberships match
        List<com.handyconnect.team.HandymanTeam> teamMemberships = handymanTeamRepository.findAll().stream()
                .filter(ht -> "APPROVED".equalsIgnoreCase(ht.getApprovalStatus()))
                .filter(ht -> {
                    if (ht.getTeam() == null) return false;
                    String tCode = ht.getTeam().getCode() != null ? ht.getTeam().getCode().toUpperCase() : "";
                    String tName = ht.getTeam().getName() != null ? ht.getTeam().getName().toLowerCase() : "";
                    return tCode.contains(catCode) || catCode.contains(tCode)
                            || tName.contains(catName) || catName.contains(tName)
                            || (catName.contains("plumb") && tName.contains("plumb"))
                            || (catName.contains("elect") && tName.contains("elect"))
                            || (catName.contains("carp") && tName.contains("carp"))
                            || (catName.contains("paint") && tName.contains("paint"))
                            || (catName.contains("hvac") && (tName.contains("hvac") || tName.contains("appl")))
                            || (catName.contains("appl") && (tName.contains("appl") || tName.contains("hvac")))
                            || (catName.contains("gen") && tName.contains("gen"));
                })
                .collect(Collectors.toList());

        for (com.handyconnect.team.HandymanTeam ht : teamMemberships) {
            if (ht.getHandyman() != null) {
                matchedHandymanIds.add(ht.getHandyman().getId());
            }
        }

        return profileRepository.findAll().stream()
                .filter(hp -> matchedHandymanIds.contains(hp.getId()))
                .filter(hp -> !"INACTIVE".equalsIgnoreCase(hp.getActiveStatus()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public HandymanDto toggleActiveStatus(Long handymanId, boolean active) {
        HandymanProfile profile = profileRepository.findById(handymanId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "id", handymanId));
        profile.setActiveStatus(active ? "ACTIVE" : "INACTIVE");
        if (profile.getUser() != null) {
            profile.getUser().setStatus(active ? "ACTIVE" : "INACTIVE");
            userRepository.save(profile.getUser());
        }
        return mapToDto(profileRepository.save(profile));
    }

    @Transactional
    public HandymanSkillDto assignSkillByAdmin(Long handymanId, HandymanSkillDto dto) {
        HandymanProfile profile = profileRepository.findById(handymanId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "id", handymanId));

        ServiceCategory category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        }

        Skill skill = null;
        if (dto.getSkillId() != null) {
            skill = catalogSkillRepository.findById(dto.getSkillId()).orElse(null);
        }

        HandymanSkill entity = new HandymanSkill();
        entity.setHandyman(profile);
        entity.setCategory(category != null ? category : categoryRepository.findAll().get(0));
        entity.setSkill(skill);
        entity.setSkillName(dto.getSkillName() != null ? dto.getSkillName() : (skill != null ? skill.getName() : "General Skill"));
        entity.setProficiencyLevel(dto.getProficiencyLevel() != null ? dto.getProficiencyLevel() : "EXPERT");
        entity.setCertificationDetails(dto.getCertificationDetails() != null ? dto.getCertificationDetails() : "Verified by Admin");
        entity.setYearsExperience(dto.getYearsExperience() != null ? dto.getYearsExperience() : 5);
        entity.setIsVerified(true);

        return new HandymanSkillDto(skillRepository.save(entity));
    }

    private HandymanDto mapToDto(HandymanProfile p) {
        HandymanDto dto = new HandymanDto();
        dto.setId(p.getId());
        if (p.getUser() != null) {
            dto.setUserId(p.getUser().getId());
            dto.setEmail(p.getUser().getEmail());
            dto.setFullName(p.getUser().getFullName());
            dto.setPhone(p.getUser().getPhone());
        }
        dto.setExperienceYears(p.getExperienceYears());
        dto.setBio(p.getBio());
        dto.setProfilePhotoUrl(p.getProfilePhotoUrl());
        dto.setServiceAreas(p.getServiceAreas());
        dto.setVerificationStatus(p.getVerificationStatus());
        dto.setVerifiedAt(p.getVerifiedAt());
        dto.setHourlyRate(p.getHourlyRate());
        dto.setServiceRadiusKm(p.getServiceRadiusKm());
        dto.setRatingAvg(p.getRatingAvg());
        dto.setRatingCount(p.getRatingCount());
        dto.setMaxActiveWorkload(p.getMaxActiveWorkload());
        dto.setAvailabilityStatus(p.getAvailabilityStatus());
        dto.setCompletedJobCount(p.getCompletedJobCount());
        dto.setActiveStatus(p.getActiveStatus());

        List<HandymanSkillDto> skills = skillRepository.findByHandymanId(p.getId()).stream()
                .map(HandymanSkillDto::new)
                .collect(Collectors.toList());
        dto.setSkills(skills);

        List<HandymanAvailabilityDto> avails = availabilityRepository.findByHandymanId(p.getId()).stream()
                .map(HandymanAvailabilityDto::new)
                .collect(Collectors.toList());
        dto.setAvailabilities(avails);

        List<HandymanSpecializationDto> specs = handymanSpecializationRepository.findByHandymanId(p.getId()).stream()
                .map(HandymanSpecializationDto::new)
                .collect(Collectors.toList());
        dto.setSpecializations(specs);

        List<HandymanCertificationDto> certs = certificationRepository.findByHandymanId(p.getId()).stream()
                .map(HandymanCertificationDto::new)
                .collect(Collectors.toList());
        dto.setCertifications(certs);

        List<HandymanServiceAreaDto> areas = serviceAreaRepository.findByHandymanId(p.getId()).stream()
                .map(HandymanServiceAreaDto::new)
                .collect(Collectors.toList());
        dto.setServiceAreaList(areas);

        List<com.handyconnect.team.HandymanTeamDto> teams = handymanTeamRepository.findByHandymanId(p.getId()).stream()
                .map(com.handyconnect.team.HandymanTeamDto::new)
                .collect(Collectors.toList());
        dto.setTeams(teams);
        teams.stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsPrimary()))
                .findFirst()
                .ifPresent(t -> dto.setPrimaryTeamName(t.getTeamName()));
        if (dto.getPrimaryTeamName() == null && !teams.isEmpty()) {
            dto.setPrimaryTeamName(teams.get(0).getTeamName());
        }

        return dto;
    }
}
