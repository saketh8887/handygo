package com.handyconnect.handyman;

import com.handyconnect.common.dto.ApiResponse;
import com.handyconnect.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Handyman Management", description = "Handyman profiles, skills, verification, and availability APIs")
public class HandymanController {

    private final HandymanService handymanService;

    public HandymanController(HandymanService handymanService) {
        this.handymanService = handymanService;
    }

    @GetMapping("/handyman/profile")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Get current handyman profile")
    public ResponseEntity<ApiResponse<HandymanDto>> getProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(handymanService.getProfileByUserId(userId)));
    }

    @PutMapping("/handyman/profile")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Update current handyman profile")
    public ResponseEntity<ApiResponse<HandymanDto>> updateProfile(@RequestBody HandymanDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Profile updated", handymanService.updateProfile(userId, dto)));
    }

    @PostMapping("/handyman/skills")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Add a professional skill")
    public ResponseEntity<ApiResponse<HandymanSkillDto>> addSkill(@RequestBody HandymanSkillDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Skill added", handymanService.addSkill(userId, dto)));
    }

    @DeleteMapping("/handyman/skills/{skillId}")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Delete a skill")
    public ResponseEntity<ApiResponse<String>> deleteSkill(@PathVariable Long skillId) {
        Long userId = SecurityUtils.getCurrentUserId();
        handymanService.deleteSkill(userId, skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill deleted", "Success"));
    }

    @PutMapping("/handyman/availability")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Update working hours and availability schedule")
    public ResponseEntity<ApiResponse<List<HandymanAvailabilityDto>>> updateAvailability(@RequestBody List<HandymanAvailabilityDto> schedule) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Schedule updated", handymanService.updateAvailabilities(userId, schedule)));
    }

    @GetMapping("/admin/handymen")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all registered handymen (Admin)")
    public ResponseEntity<ApiResponse<List<HandymanDto>>> getAllHandymen() {
        return ResponseEntity.ok(ApiResponse.success(handymanService.getAllHandymen()));
    }

    @PostMapping("/admin/handymen/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify or reject handyman profile (Admin)")
    public ResponseEntity<ApiResponse<HandymanDto>> verifyHandyman(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Long adminId = SecurityUtils.getCurrentUserId();
        boolean approved = body.getOrDefault("approved", true);
        return ResponseEntity.ok(ApiResponse.success("Handyman status updated", handymanService.verifyHandyman(id, approved, adminId)));
    }
}
