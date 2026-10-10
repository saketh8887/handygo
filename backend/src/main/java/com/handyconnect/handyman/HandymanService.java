package com.handyconnect.handyman;

import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.servicecatalog.ServiceCategory;
import com.handyconnect.servicecatalog.ServiceCategoryRepository;
import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HandymanService {

    private final HandymanProfileRepository profileRepository;
    private final HandymanSkillRepository skillRepository;
    private final HandymanAvailabilityRepository availabilityRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public HandymanService(HandymanProfileRepository profileRepository,
                           HandymanSkillRepository skillRepository,
                           HandymanAvailabilityRepository availabilityRepository,
                           ServiceCategoryRepository categoryRepository,
                           UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.availabilityRepository = availabilityRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
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
        if (dto.getServiceAreas() != null) profile.setServiceAreas(dto.getServiceAreas());
        if (dto.getHourlyRate() != null) profile.setHourlyRate(dto.getHourlyRate());
        if (dto.getServiceRadiusKm() != null) profile.setServiceRadiusKm(dto.getServiceRadiusKm());
        if (dto.getActiveStatus() != null) profile.setActiveStatus(dto.getActiveStatus());

        return mapToDto(profileRepository.save(profile));
    }

    @Transactional
    public HandymanSkillDto addSkill(Long userId, HandymanSkillDto dto) {
        HandymanProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "userId", userId));

        ServiceCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory", "id", dto.getCategoryId()));

        HandymanSkill skill = new HandymanSkill(
                profile,
                category,
                dto.getSkillName(),
                dto.getCertificationDetails(),
                dto.getYearsExperience() != null ? dto.getYearsExperience() : 1
        );

        return new HandymanSkillDto(skillRepository.save(skill));
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
        dto.setServiceAreas(p.getServiceAreas());
        dto.setVerificationStatus(p.getVerificationStatus());
        dto.setVerifiedAt(p.getVerifiedAt());
        dto.setHourlyRate(p.getHourlyRate());
        dto.setServiceRadiusKm(p.getServiceRadiusKm());
        dto.setRatingAvg(p.getRatingAvg());
        dto.setRatingCount(p.getRatingCount());
        dto.setActiveStatus(p.getActiveStatus());

        List<HandymanSkillDto> skills = skillRepository.findByHandymanId(p.getId()).stream()
                .map(HandymanSkillDto::new)
                .collect(Collectors.toList());
        dto.setSkills(skills);

        List<HandymanAvailabilityDto> avails = availabilityRepository.findByHandymanId(p.getId()).stream()
                .map(HandymanAvailabilityDto::new)
                .collect(Collectors.toList());
        dto.setAvailabilities(avails);

        return dto;
    }
}
