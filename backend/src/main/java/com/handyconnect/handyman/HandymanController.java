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
@Tag(name = "Handyman Management", description = "Handyman profiles, skills, specializations, certifications, and availability APIs")
public class HandymanController {

    private final HandymanService handymanService;

    public HandymanController(HandymanService handymanService) {
        this.handymanService = handymanService;
    }

    // --- Profile ---

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

    // --- Specializations & Catalog Skills ---

    @GetMapping("/specializations")
    @Operation(summary = "Get all active technician specializations")
    public ResponseEntity<ApiResponse<List<SpecializationDto>>> getSpecializations() {
        return ResponseEntity.ok(ApiResponse.success(handymanService.getAllSpecializations()));
    }

    @PostMapping("/admin/specializations")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new technician specialization (Admin)")
    public ResponseEntity<ApiResponse<SpecializationDto>> createSpecialization(@RequestBody SpecializationDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Specialization created", handymanService.createSpecialization(dto)));
    }

    @GetMapping("/skills")
    @Operation(summary = "Get all skills in the catalog")
    public ResponseEntity<ApiResponse<List<SkillDto>>> getAllSkills() {
        return ResponseEntity.ok(ApiResponse.success(handymanService.getAllSkills()));
    }

    @GetMapping("/skills/specialization/{specId}")
    @Operation(summary = "Get skills for a specific specialization")
    public ResponseEntity<ApiResponse<List<SkillDto>>> getSkillsBySpecialization(@PathVariable Long specId) {
        return ResponseEntity.ok(ApiResponse.success(handymanService.getSkillsBySpecialization(specId)));
    }

    @PostMapping("/admin/skills")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new skill in the catalog (Admin)")
    public ResponseEntity<ApiResponse<SkillDto>> createSkill(@RequestBody SkillDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Skill created", handymanService.createSkill(dto)));
    }

    // --- Handyman Specializations ---

    @PutMapping("/handyman/specializations")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Configure verified specializations for current technician")
    public ResponseEntity<ApiResponse<List<HandymanSpecializationDto>>> updateSpecializations(@RequestBody List<HandymanSpecializationDto> specs) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Specializations updated", handymanService.updateHandymanSpecializations(userId, specs)));
    }

    // --- Handyman Skills ---

    @PostMapping("/handyman/skills")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Add an individual trade skill")
    public ResponseEntity<ApiResponse<HandymanSkillDto>> addSkill(@RequestBody HandymanSkillDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Skill added", handymanService.addSkill(userId, dto)));
    }

    @DeleteMapping("/handyman/skills/{skillId}")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Delete an individual trade skill")
    public ResponseEntity<ApiResponse<String>> deleteSkill(@PathVariable Long skillId) {
        Long userId = SecurityUtils.getCurrentUserId();
        handymanService.deleteSkill(userId, skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill deleted", "Success"));
    }

    // --- Handyman Certifications ---

    @GetMapping("/handyman/{handymanId}/certifications")
    @Operation(summary = "Get certifications and credentials for a technician")
    public ResponseEntity<ApiResponse<List<HandymanCertificationDto>>> getCertifications(@PathVariable Long handymanId) {
        return ResponseEntity.ok(ApiResponse.success(handymanService.getCertifications(handymanId)));
    }

    @PostMapping("/handyman/certifications")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Add a trade certification / license")
    public ResponseEntity<ApiResponse<HandymanCertificationDto>> addCertification(@RequestBody HandymanCertificationDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Certification added and submitted for review", handymanService.addCertification(userId, dto)));
    }

    @DeleteMapping("/handyman/certifications/{certId}")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Remove a certification")
    public ResponseEntity<ApiResponse<String>> deleteCertification(@PathVariable Long certId) {
        Long userId = SecurityUtils.getCurrentUserId();
        handymanService.deleteCertification(userId, certId);
        return ResponseEntity.ok(ApiResponse.success("Certification removed", "Success"));
    }

    @PostMapping("/admin/certifications/{certId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify or reject a technician certification (Admin)")
    public ResponseEntity<ApiResponse<HandymanCertificationDto>> verifyCertification(
            @PathVariable Long certId,
            @RequestBody Map<String, Object> body
    ) {
        boolean approved = Boolean.parseBoolean(body.getOrDefault("approved", "true").toString());
        String notes = body.getOrDefault("notes", "Verified by compliance team").toString();
        Long adminId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Certification status updated", handymanService.verifyCertification(certId, approved, notes, adminId)));
    }

    // --- Handyman Service Areas ---

    @GetMapping("/handyman/{handymanId}/service-areas")
    @Operation(summary = "Get service coverage areas for a technician")
    public ResponseEntity<ApiResponse<List<HandymanServiceAreaDto>>> getServiceAreas(@PathVariable Long handymanId) {
        return ResponseEntity.ok(ApiResponse.success(handymanService.getServiceAreas(handymanId)));
    }

    @PutMapping("/handyman/service-areas")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Update service coverage areas for current technician")
    public ResponseEntity<ApiResponse<List<HandymanServiceAreaDto>>> updateServiceAreas(@RequestBody List<HandymanServiceAreaDto> areas) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Service areas updated", handymanService.updateServiceAreas(userId, areas)));
    }

    // --- Availability & Status ---

    @PutMapping("/handyman/availability")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Update working hours and availability schedule")
    public ResponseEntity<ApiResponse<List<HandymanAvailabilityDto>>> updateAvailability(@RequestBody List<HandymanAvailabilityDto> schedule) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Schedule updated", handymanService.updateAvailabilities(userId, schedule)));
    }

    // --- Admin Endpoints ---

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

    @GetMapping("/categories/{categoryId}/handymen")
    @Operation(summary = "Get qualified technicians for a specific specialized service category")
    public ResponseEntity<ApiResponse<List<HandymanDto>>> getHandymenByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success(handymanService.getHandymenByCategoryId(categoryId)));
    }

    @PatchMapping("/admin/handymen/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate or deactivate a handyman account (Admin)")
    public ResponseEntity<ApiResponse<HandymanDto>> toggleActiveStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        boolean active = Boolean.parseBoolean(body.getOrDefault("active", "true").toString());
        return ResponseEntity.ok(ApiResponse.success("Technician account status updated", handymanService.toggleActiveStatus(id, active)));
    }

    @PostMapping("/admin/handymen/{id}/skills")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign a trade skill and category to a handyman (Admin)")
    public ResponseEntity<ApiResponse<HandymanSkillDto>> assignSkillByAdmin(@PathVariable Long id, @RequestBody HandymanSkillDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Skill assigned to technician", handymanService.assignSkillByAdmin(id, dto)));
    }
}
