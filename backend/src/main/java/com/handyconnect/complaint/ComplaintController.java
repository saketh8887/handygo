package com.handyconnect.complaint;

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
@RequestMapping("/api/v1/complaints")
@Tag(name = "Complaints", description = "Customer grievance and resolution management APIs")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    @Operation(summary = "Customer files a complaint on a booking")
    public ResponseEntity<ApiResponse<ComplaintDto>> fileComplaint(@RequestBody Map<String, String> body) {
        Long bookingId = Long.valueOf(body.get("bookingId"));
        String category = body.getOrDefault("category", "QUALITY");
        String description = body.get("description");
        Long customerId = SecurityUtils.getCurrentUserId();

        return ResponseEntity.ok(ApiResponse.success("Complaint filed", complaintService.fileComplaint(bookingId, category, description, customerId)));
    }

    @GetMapping("/my-complaints")
    @Operation(summary = "Get complaints filed by current customer")
    public ResponseEntity<ApiResponse<List<ComplaintDto>>> getMyComplaints() {
        Long customerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(complaintService.getComplaintsForCustomer(customerId)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all complaints (Admin)")
    public ResponseEntity<ApiResponse<List<ComplaintDto>>> getAllComplaints() {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getAllComplaints()));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin updates/resolves complaint")
    public ResponseEntity<ApiResponse<ComplaintDto>> resolveComplaint(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "RESOLVED");
        String notes = body.getOrDefault("resolutionNotes", "Issue reviewed and addressed");
        Long adminId = SecurityUtils.getCurrentUserId();

        return ResponseEntity.ok(ApiResponse.success("Complaint updated", complaintService.resolveComplaint(id, status, notes, adminId)));
    }
}
