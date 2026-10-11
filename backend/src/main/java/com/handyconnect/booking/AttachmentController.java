package com.handyconnect.booking;

import com.handyconnect.common.dto.ApiResponse;
import com.handyconnect.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Attachments & Photos", description = "Secure problem photo uploading and authorized viewing")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping(value = "/attachments/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload one or multiple problem photos (Max 5 files, 5 MB each)")
    public ResponseEntity<ApiResponse<List<AttachmentDto>>> uploadAttachments(
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "file", required = false) MultipartFile singleFile
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<AttachmentDto> uploaded = new ArrayList<>();

        if (files != null && files.length > 0) {
            for (MultipartFile f : files) {
                if (f != null && !f.isEmpty()) {
                    uploaded.add(attachmentService.storeAttachment(f, currentUserId));
                }
            }
        } else if (singleFile != null && !singleFile.isEmpty()) {
            uploaded.add(attachmentService.storeAttachment(singleFile, currentUserId));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("No files provided for upload"));
        }

        return ResponseEntity.ok(ApiResponse.success("Photos uploaded successfully", uploaded));
    }

    @GetMapping("/attachments/{id}")
    @Operation(summary = "Retrieve an authorized image attachment by ID")
    public ResponseEntity<Resource> getAttachment(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        AttachmentService.AttachmentResourceResult result = attachmentService.getAttachmentResource(id, currentUserId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(result.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + result.getFilename() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=86400")
                .body(result.getResource());
    }

    @GetMapping("/bookings/{bookingId}/attachments")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List all photo attachments for a booking")
    public ResponseEntity<ApiResponse<List<AttachmentDto>>> getBookingAttachments(@PathVariable Long bookingId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<AttachmentDto> attachments = attachmentService.getAttachmentsForBooking(bookingId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(attachments));
    }
}
