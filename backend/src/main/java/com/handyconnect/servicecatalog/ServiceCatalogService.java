package com.handyconnect.servicecatalog;

import com.handyconnect.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceCatalogService {

    private final ServiceCategoryRepository categoryRepository;
    private final ServiceEntityRepository serviceRepository;
    private final ServiceMaterialRepository materialRepository;

    public ServiceCatalogService(ServiceCategoryRepository categoryRepository,
                                 ServiceEntityRepository serviceRepository,
                                 ServiceMaterialRepository materialRepository) {
        this.categoryRepository = categoryRepository;
        this.serviceRepository = serviceRepository;
        this.materialRepository = materialRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceCategoryDto> getAllCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(ServiceCategoryDto::new)
                .collect(Collectors.toList());
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

    private ServiceDto mapToDtoWithMaterials(ServiceEntity entity) {
        ServiceDto dto = new ServiceDto(entity);
        List<ServiceMaterialDto> materials = materialRepository.findByServiceId(entity.getId()).stream()
                .map(ServiceMaterialDto::new)
                .collect(Collectors.toList());
        dto.setStandardMaterials(materials);
        return dto;
    }
}
