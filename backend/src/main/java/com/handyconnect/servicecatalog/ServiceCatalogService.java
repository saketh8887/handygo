package com.handyconnect.servicecatalog;

import com.handyconnect.booking.BookingRepository;
import com.handyconnect.booking.BookingStatus;
import com.handyconnect.common.exception.BadRequestException;
import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.handyman.HandymanDto;
import com.handyconnect.handyman.HandymanService;
import com.handyconnect.handyman.Skill;
import com.handyconnect.handyman.SkillRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceCatalogService {

    private final ServiceCategoryRepository categoryRepository;
    private final ServiceEntityRepository serviceRepository;
    private final ServiceMaterialRepository materialRepository;
    private final ServiceRequiredSkillRepository serviceRequiredSkillRepository;
    private final SkillRepository skillRepository;
    private final HandymanService handymanService;
    private final BookingRepository bookingRepository;

    public ServiceCatalogService(ServiceCategoryRepository categoryRepository,
                                 ServiceEntityRepository serviceRepository,
                                 ServiceMaterialRepository materialRepository,
                                 ServiceRequiredSkillRepository serviceRequiredSkillRepository,
                                 SkillRepository skillRepository,
                                 @Lazy HandymanService handymanService,
                                 BookingRepository bookingRepository) {
        this.categoryRepository = categoryRepository;
        this.serviceRepository = serviceRepository;
        this.materialRepository = materialRepository;
        this.serviceRequiredSkillRepository = serviceRequiredSkillRepository;
        this.skillRepository = skillRepository;
        this.handymanService = handymanService;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceCategoryDto> getAllCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::enrichCategoryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceCategoryDto> getAllCategoriesAdmin() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::enrichCategoryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceCategoryDto getCategoryById(Long id) {
        ServiceCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory", "id", id));
        return enrichCategoryDto(cat);
    }

    @Transactional
    public ServiceCategoryDto createCategory(ServiceCategoryDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Category name is required");
        }
        String trimmedName = dto.getName().trim();
        if (categoryRepository.existsByName(trimmedName)) {
            throw new BadRequestException("A category with name '" + trimmedName + "' already exists");
        }

        String code = dto.getCode();
        if (code == null || code.trim().isEmpty()) {
            code = trimmedName.toUpperCase().replaceAll("[^A-Z0-9]+", "_");
        } else {
            code = code.trim().toUpperCase();
        }
        if (categoryRepository.existsByCode(code)) {
            code = code + "_" + (System.currentTimeMillis() % 10000);
        }

        ServiceCategory cat = new ServiceCategory();
        cat.setName(trimmedName);
        cat.setCode(code);
        cat.setDescription(dto.getDescription());
        cat.setIconName(dto.getIconName() != null ? dto.getIconName() : "Wrench");
        cat.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 99);
        cat.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        ServiceCategory saved = categoryRepository.save(cat);
        return enrichCategoryDto(saved);
    }

    @Transactional
    public ServiceCategoryDto updateCategory(Long id, ServiceCategoryDto dto) {
        ServiceCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory", "id", id));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            String newName = dto.getName().trim();
            if (!newName.equalsIgnoreCase(cat.getName()) && categoryRepository.existsByName(newName)) {
                throw new BadRequestException("Another category with name '" + newName + "' already exists");
            }
            cat.setName(newName);
        }
        if (dto.getDescription() != null) {
            cat.setDescription(dto.getDescription());
        }
        if (dto.getIconName() != null) {
            cat.setIconName(dto.getIconName());
        }
        if (dto.getDisplayOrder() != null) {
            cat.setDisplayOrder(dto.getDisplayOrder());
        }
        if (dto.getIsActive() != null) {
            cat.setIsActive(dto.getIsActive());
        }

        ServiceCategory saved = categoryRepository.save(cat);
        return enrichCategoryDto(saved);
    }

    @Transactional
    public void toggleCategoryStatus(Long id, boolean active) {
        ServiceCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory", "id", id));
        cat.setIsActive(active);
        categoryRepository.save(cat);
    }

    @Transactional
    public void deleteCategory(Long id) {
        ServiceCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory", "id", id));

        long serviceCount = serviceRepository.countByCategoryId(id);
        long bookingCount = 0;
        try {
            bookingCount = bookingRepository.countByCategoryId(id);
        } catch (Exception ignored) {}

        if (serviceCount > 0 || bookingCount > 0) {
            throw new BadRequestException("Cannot delete category '" + cat.getName() + "' because it is referenced by "
                    + serviceCount + " service(s) and " + bookingCount + " booking(s). Please deactivate it instead.");
        }

        categoryRepository.delete(cat);
    }

    private ServiceCategoryDto enrichCategoryDto(ServiceCategory cat) {
        ServiceCategoryDto dto = new ServiceCategoryDto(cat);
        List<ServiceEntity> services = serviceRepository.findByCategoryId(cat.getId());
        dto.setServicesCount((long) services.size());
        dto.setExampleServices(services.stream().map(ServiceEntity::getName).limit(5).collect(Collectors.toList()));

        try {
            List<HandymanDto> handymen = handymanService.getHandymenByCategoryId(cat.getId());
            dto.setQualifiedHandymenCount((long) handymen.size());
        } catch (Exception e) {
            dto.setQualifiedHandymenCount(0L);
        }

        try {
            long pending = bookingRepository.countByCategoryIdAndStatus(cat.getId(), BookingStatus.PENDING)
                    + bookingRepository.countByCategoryIdAndStatus(cat.getId(), BookingStatus.ASSIGNED)
                    + bookingRepository.countByCategoryIdAndStatus(cat.getId(), BookingStatus.ACCEPTED)
                    + bookingRepository.countByCategoryIdAndStatus(cat.getId(), BookingStatus.IN_PROGRESS);
            long completed = bookingRepository.countByCategoryIdAndStatus(cat.getId(), BookingStatus.COMPLETED);
            dto.setPendingBookingsCount(pending);
            dto.setCompletedBookingsCount(completed);
        } catch (Exception e) {
            dto.setPendingBookingsCount(0L);
            dto.setCompletedBookingsCount(0L);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<ServiceDto> getAllServices() {
        return serviceRepository.findByIsActiveTrue().stream()
                .map(this::mapToDtoWithMaterials)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceDto> getServicesByCategory(Long categoryId) {
        return serviceRepository.findByCategoryIdAndIsActiveTrue(categoryId).stream()
                .map(this::mapToDtoWithMaterials)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceDto getServiceById(Long id) {
        ServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        return mapToDtoWithMaterials(entity);
    }

    @Transactional
    public ServiceDto createService(ServiceDto dto) {
        ServiceCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory", "id", dto.getCategoryId()));

        ServiceEntity entity = new ServiceEntity();
        entity.setCategory(category);
        entity.setName(dto.getName());
        entity.setCode(dto.getCode());
        entity.setDescription(dto.getDescription());
        entity.setIndicativeBasePrice(dto.getIndicativeBasePrice());
        entity.setEstimatedDurationMinutes(dto.getEstimatedDurationMinutes());
        entity.setRequiredSkills(dto.getRequiredSkills());
        entity.setIsActive(true);

        ServiceEntity saved = serviceRepository.save(entity);

        if (dto.getRequiredSkillsList() != null && !dto.getRequiredSkillsList().isEmpty()) {
            updateRequiredSkills(saved.getId(), dto.getRequiredSkillsList());
        }

        return mapToDtoWithMaterials(saved);
    }

    @Transactional
    public ServiceDto updateService(Long id, ServiceDto dto) {
        ServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        if (dto.getCategoryId() != null) {
            ServiceCategory category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory", "id", dto.getCategoryId()));
            entity.setCategory(category);
        }
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getIndicativeBasePrice() != null) entity.setIndicativeBasePrice(dto.getIndicativeBasePrice());
        if (dto.getEstimatedDurationMinutes() != null) entity.setEstimatedDurationMinutes(dto.getEstimatedDurationMinutes());
        if (dto.getRequiredSkills() != null) entity.setRequiredSkills(dto.getRequiredSkills());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());

        if (dto.getRequiredSkillsList() != null) {
            updateRequiredSkills(id, dto.getRequiredSkillsList());
        }

        ServiceEntity saved = serviceRepository.save(entity);
        return mapToDtoWithMaterials(saved);
    }

    @Transactional
    public void toggleServiceStatus(Long id, boolean active) {
        ServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        entity.setIsActive(active);
        serviceRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<ServiceRequiredSkillDto> getRequiredSkillsForService(Long serviceId) {
        return serviceRequiredSkillRepository.findByServiceId(serviceId).stream()
                .map(ServiceRequiredSkillDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ServiceRequiredSkillDto> updateRequiredSkills(Long serviceId, List<ServiceRequiredSkillDto> skillsList) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", serviceId));

        serviceRequiredSkillRepository.deleteByServiceId(serviceId);

        List<ServiceRequiredSkill> saved = new ArrayList<>();
        if (skillsList != null) {
            for (ServiceRequiredSkillDto dto : skillsList) {
                if (dto.getSkillId() != null) {
                    Skill skill = skillRepository.findById(dto.getSkillId())
                            .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", dto.getSkillId()));
                    ServiceRequiredSkill srs = new ServiceRequiredSkill(
                            service,
                            skill,
                            dto.getIsMandatory() != null ? dto.getIsMandatory() : true,
                            dto.getMinProficiency() != null ? dto.getMinProficiency() : "INTERMEDIATE"
                    );
                    saved.add(serviceRequiredSkillRepository.save(srs));
                }
            }
        }
        return saved.stream().map(ServiceRequiredSkillDto::new).collect(Collectors.toList());
    }

    private ServiceDto mapToDtoWithMaterials(ServiceEntity entity) {
        ServiceDto dto = new ServiceDto(entity);
        List<ServiceMaterialDto> materials = materialRepository.findByServiceId(entity.getId()).stream()
                .map(ServiceMaterialDto::new)
                .collect(Collectors.toList());
        dto.setStandardMaterials(materials);

        List<ServiceRequiredSkillDto> reqSkills = serviceRequiredSkillRepository.findByServiceId(entity.getId()).stream()
                .map(ServiceRequiredSkillDto::new)
                .collect(Collectors.toList());
        dto.setRequiredSkillsList(reqSkills);

        return dto;
    }
}
