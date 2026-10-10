package com.handyconnect.customer;

import com.handyconnect.common.dto.ApiResponse;
import com.handyconnect.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer")
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
@Tag(name = "Customer Management", description = "Customer profile and saved address management")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current customer profile")
    public ResponseEntity<ApiResponse<CustomerDto>> getProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerProfile(userId)));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update customer profile")
    public ResponseEntity<ApiResponse<CustomerDto>> updateProfile(@RequestBody CustomerDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Profile updated", customerService.updateCustomerProfile(userId, dto)));
    }

    @GetMapping("/addresses")
    @Operation(summary = "Get saved customer addresses")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddresses() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(customerService.getAddresses(userId)));
    }

    @PostMapping("/addresses")
    @Operation(summary = "Save a new address")
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(@RequestBody AddressDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Address added", customerService.addAddress(userId, dto)));
    }

    @DeleteMapping("/addresses/{id}")
    @Operation(summary = "Delete a saved address")
    public ResponseEntity<ApiResponse<String>> deleteAddress(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        customerService.deleteAddress(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", "Success"));
    }
}
