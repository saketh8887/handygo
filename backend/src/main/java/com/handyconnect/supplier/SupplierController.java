package com.handyconnect.supplier;

import com.handyconnect.common.dto.ApiResponse;
import com.handyconnect.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
@Tag(name = "Suppliers", description = "Supplier catalog and quotation management APIs")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    @Operation(summary = "Get all approved suppliers")
    public ResponseEntity<ApiResponse<List<SupplierDto>>> getAllSuppliers() {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getAllSuppliers()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier details and product catalog by ID")
    public ResponseEntity<ApiResponse<SupplierDto>> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplierById(id)));
    }

    @GetMapping("/my-profile")
    @PreAuthorize("hasRole('SUPPLIER')")
    @Operation(summary = "Get current supplier profile and items")
    public ResponseEntity<ApiResponse<SupplierDto>> getMySupplierProfile() {
        String email = SecurityUtils.getCurrentUser().getUsername();
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplierByEmail(email)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add a new vendor / supplier (Admin)")
    public ResponseEntity<ApiResponse<SupplierDto>> createSupplier(@RequestBody SupplierDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Supplier registered", supplierService.createSupplier(dto)));
    }

    @PostMapping("/{id}/catalog")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'ADMIN')")
    @Operation(summary = "Add or update item in supplier product catalog")
    public ResponseEntity<ApiResponse<String>> addCatalogItem(@PathVariable Long id, @RequestBody SupplierDto.SupplierCatalogItemDto itemDto) {
        supplierService.addCatalogItem(id, itemDto);
        return ResponseEntity.ok(ApiResponse.success("Item saved in catalog", "Success"));
    }
}
