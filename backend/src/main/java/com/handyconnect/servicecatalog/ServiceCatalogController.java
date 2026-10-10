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
}
