package com.handyconnect.booking;

import com.handyconnect.common.dto.ApiResponse;
import com.handyconnect.logistics.JobReadinessEvaluation;
import com.handyconnect.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Booking and Job Management", description = "Service booking, assignment, status transitions, and completion APIs")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Customer creates a service booking")
    public ResponseEntity<ApiResponse<BookingDto>> createBooking(@Valid @RequestBody BookingRequest request) {
        Long customerId = SecurityUtils.getCurrentUserId();
        BookingDto booking = bookingService.createBooking(request, customerId);
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", booking));
    }

    @GetMapping
    @Operation(summary = "Get bookings list (role-filtered)")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getBookings() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingsForUser(userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking details by ID")
    public ResponseEntity<ApiResponse<BookingDto>> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id)));
    }

    @GetMapping("/{id}/readiness")
    @Operation(summary = "Evaluate Job Readiness and Material Coordination for a booking")
    public ResponseEntity<ApiResponse<JobReadinessEvaluation>> getReadiness(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.evaluateBookingReadiness(id)));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin assigns an eligible handyman to booking")
    public ResponseEntity<ApiResponse<BookingDto>> assignHandyman(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Long handymanId = body.get("handymanId");
        Long adminId = SecurityUtils.getCurrentUserId();
        BookingDto updated = bookingService.assignHandyman(id, handymanId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Handyman assigned successfully", updated));
    }

    @PostMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Handyman accepts or declines assignment")
    public ResponseEntity<ApiResponse<BookingDto>> respondToAssignment(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        boolean accept = Boolean.parseBoolean(body.getOrDefault("accept", "true").toString());
        String reason = body.getOrDefault("rejectionReason", "").toString();
        Long handymanUserId = SecurityUtils.getCurrentUserId();
        BookingDto updated = bookingService.respondToAssignment(id, handymanUserId, accept, reason);
        return ResponseEntity.ok(ApiResponse.success("Assignment response recorded", updated));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status (ON_THE_WAY, ARRIVED, IN_PROGRESS, WAITING_FOR_MATERIALS, CANCELLED)")
    public ResponseEntity<ApiResponse<BookingDto>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        String notes = body.getOrDefault("notes", "Status updated");
        BookingStatus status = BookingStatus.valueOf(statusStr.toUpperCase());
        Long userId = SecurityUtils.getCurrentUserId();
        BookingDto updated = bookingService.updateStatus(id, status, notes, userId);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + status, updated));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('HANDYMAN', 'ADMIN')")
    @Operation(summary = "Handyman records material consumption and marks job completed")
    public ResponseEntity<ApiResponse<BookingDto>> completeJob(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BigDecimal usedAmount = body.get("materialsAmount") != null ? new BigDecimal(body.get("materialsAmount").toString()) : BigDecimal.ZERO;
        String completionNotes = body.getOrDefault("completionNotes", "Job completed satisfactorily").toString();
        String photoUrl = body.getOrDefault("completionPhotoUrl", "").toString();
        Long handymanUserId = SecurityUtils.getCurrentUserId();

        BookingDto updated = bookingService.recordMaterialsAndComplete(id, usedAmount, completionNotes, photoUrl, handymanUserId);
        return ResponseEntity.ok(ApiResponse.success("Job completed and invoice generated", updated));
    }
}
