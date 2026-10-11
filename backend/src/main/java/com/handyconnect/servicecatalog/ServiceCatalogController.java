package com.handyconnect.servicecatalog;

import com.handyconnect.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Service Catalog", description = "Service Categories and Services Management APIs")
public class ServiceCatalogController {

    private final ServiceCatalogService serviceCatalogService;

    public ServiceCatalogController(ServiceCatalogService serviceCatalogService) {
        this.serviceCatalogService = serviceCatalogService;
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all active service categories")
    public ResponseEntity<ApiResponse<List<ServiceCategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(serviceCatalogService.getAllCategories()));
    }

    @GetMapping("/categories/{id}")
    @Operation(summary = "Get category details by ID")
    public ResponseEntity<ApiResponse<ServiceCategoryDto>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(serviceCatalogService.getCategoryById(id)));
    }

    @GetMapping("/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all service categories including inactive with metrics (Admin)")
    public ResponseEntity<ApiResponse<List<ServiceCategoryDto>>> getAllCategoriesAdmin() {
        return ResponseEntity.ok(ApiResponse.success(serviceCatalogService.getAllCategoriesAdmin()));
    }

    @PostMapping("/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new service category (Admin)")
    public ResponseEntity<ApiResponse<ServiceCategoryDto>> createCategory(@RequestBody ServiceCategoryDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", serviceCatalogService.createCategory(dto)));
    }

    @PutMapping("/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing service category (Admin)")
    public ResponseEntity<ApiResponse<ServiceCategoryDto>> updateCategory(@PathVariable Long id, @RequestBody ServiceCategoryDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", serviceCatalogService.updateCategory(id, dto)));
    }

    @PatchMapping("/admin/categories/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle active status of a category (Admin)")
    public ResponseEntity<ApiResponse<String>> toggleCategoryStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean active = body.getOrDefault("isActive", true);
        serviceCatalogService.toggleCategoryStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Category status updated", "Active: " + active));
    }

    @DeleteMapping("/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete category guarded against referenced services or bookings (Admin)")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Long id) {
        serviceCatalogService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", "Deleted"));
    }

    @GetMapping("/services")
    @Operation(summary = "Get all active services with standard material requirements")
    public ResponseEntity<ApiResponse<List<ServiceDto>>> getAllServices() {
        return ResponseEntity.ok(ApiResponse.success(serviceCatalogService.getAllServices()));
    }

    @GetMapping("/services/category/{categoryId}")
    @Operation(summary = "Get services by category ID")
    public ResponseEntity<ApiResponse<List<ServiceDto>>> getServicesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success(serviceCatalogService.getServicesByCategory(categoryId)));
    }

    @GetMapping("/services/{id}")
    @Operation(summary = "Get service details by ID")
    public ResponseEntity<ApiResponse<ServiceDto>> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(serviceCatalogService.getServiceById(id)));
    }

    @PostMapping("/admin/services")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new service (Admin)")
    public ResponseEntity<ApiResponse<ServiceDto>> createService(@RequestBody ServiceDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Service created", serviceCatalogService.createService(dto)));
    }

    @PutMapping("/admin/services/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing service (Admin)")
    public ResponseEntity<ApiResponse<ServiceDto>> updateService(@PathVariable Long id, @RequestBody ServiceDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Service updated", serviceCatalogService.updateService(id, dto)));
    }

    @PatchMapping("/admin/services/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle active status of a service (Admin)")
    public ResponseEntity<ApiResponse<String>> toggleStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean active = body.getOrDefault("isActive", true);
        serviceCatalogService.toggleServiceStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Service status updated", "Active: " + active));
    }

    @GetMapping("/services/{id}/required-skills")
    @Operation(summary = "Get skills required for a service")
    public ResponseEntity<ApiResponse<List<ServiceRequiredSkillDto>>> getRequiredSkills(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(serviceCatalogService.getRequiredSkillsForService(id)));
    }

    @PutMapping("/admin/services/{id}/required-skills")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Configure required skills for a service (Admin)")
    public ResponseEntity<ApiResponse<List<ServiceRequiredSkillDto>>> updateRequiredSkills(
            @PathVariable Long id,
            @RequestBody List<ServiceRequiredSkillDto> skillsList
    ) {
        return ResponseEntity.ok(ApiResponse.success("Required skills updated", serviceCatalogService.updateRequiredSkills(id, skillsList)));
    }
}
