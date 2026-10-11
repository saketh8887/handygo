package com.handyconnect.booking;

import com.handyconnect.common.exception.BadRequestException;
import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.security.SecurityUtils;
import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    private static final Logger log = LoggerFactory.getLogger(AttachmentService.class);

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final int MAX_PHOTOS_PER_BOOKING = 5;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final BookingAttachmentRepository attachmentRepository;
    private final BookingAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final Path uploadLocation;

    public AttachmentService(
            BookingAttachmentRepository attachmentRepository,
            BookingAssignmentRepository assignmentRepository,
            UserRepository userRepository,
            @Value("${handyconnect.upload.dir:uploads/attachments}") String uploadDir
    ) {
        this.attachmentRepository = attachmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;

        Path configuredPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(configuredPath);
            this.uploadLocation = configuredPath;
            log.info("Initialized secure attachment storage at: {}", this.uploadLocation);
        } catch (IOException e) {
            log.error("Could not create upload storage directory at: {}", configuredPath, e);
            throw new RuntimeException("Could not initialize upload storage location", e);
        }
    }

    /**
     * Securely validates and persists an uploaded image file to filesystem and database.
     */
    @Transactional
    public AttachmentDto storeAttachment(MultipartFile file, Long uploaderUserId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File size exceeds maximum allowed 5 MB");
        }

        User uploader = userRepository.findById(uploaderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", uploaderUserId));

        // 1. Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file format. Only JPEG, PNG, and WebP images are allowed.");
        }

        // 2. Validate file extension
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "photo.jpg"));
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + originalFilename);
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Invalid file extension '." + extension + "'. Allowed: JPG, JPEG, PNG, WebP.");
        }

        // 3. Inspect magic bytes / file signature
        validateImageMagicBytes(file);

        // 4. Generate collision-resistant unique filename
        String storedFilename = UUID.randomUUID() + "_" + System.currentTimeMillis() + "." + extension;
        Path targetPath = this.uploadLocation.resolve(storedFilename).normalize();

        if (!targetPath.startsWith(this.uploadLocation)) {
            throw new SecurityException("Path traversal attempt detected");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to write attachment file to disk: {}", targetPath, e);
            throw new RuntimeException("Could not save attachment file to disk", e);
        }

        // 5. Persist metadata to database
        BookingAttachment attachment = new BookingAttachment(
                uploader,
                originalFilename,
                storedFilename,
                targetPath.toString(),
                contentType,
                file.getSize()
        );

        BookingAttachment saved = attachmentRepository.save(attachment);
        log.info("Persisted attachment id: {}, file: {} for user: {}", saved.getId(), storedFilename, uploaderUserId);

        return new AttachmentDto(saved);
    }

    /**
     * Associate temporary uploaded attachments with a newly created booking.
     */
    @Transactional
    public void linkAttachmentsToBooking(List<Long> attachmentIds, Booking booking, Long uploaderUserId) {
        if (attachmentIds == null || attachmentIds.isEmpty()) {
            return;
        }

        if (attachmentIds.size() > MAX_PHOTOS_PER_BOOKING) {
            throw new BadRequestException("Maximum " + MAX_PHOTOS_PER_BOOKING + " photos allowed per booking");
        }

        List<BookingAttachment> attachments = attachmentRepository.findByIdIn(attachmentIds);
        for (BookingAttachment att : attachments) {
            if (!att.getUploader().getId().equals(uploaderUserId)) {
                throw new AccessDeniedException("Cannot link attachment id " + att.getId() + " belonging to another user");
            }
            att.setBooking(booking);
            booking.addAttachment(att);
            attachmentRepository.save(att);
        }

        if ((booking.getPhotoUrl() == null || booking.getPhotoUrl().isBlank()) && !attachments.isEmpty()) {
            booking.setPhotoUrl("/api/v1/attachments/" + attachments.get(0).getId());
        }
    }

    /**
     * Retrieve authorized image file resource with role-based access control.
     */
    @Transactional(readOnly = true)
    public AttachmentResourceResult getAttachmentResource(Long attachmentId, Long currentUserId) {
        BookingAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", "id", attachmentId));

        verifyAccess(attachment, currentUserId);

        try {
            Path filePath = Paths.get(attachment.getStoragePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return new AttachmentResourceResult(resource, attachment.getContentType(), attachment.getOriginalFilename());
            } else {
                log.warn("Attachment file missing on disk: {}", filePath);
                throw new ResourceNotFoundException("Attachment file not found on disk");
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Attachment file URL invalid");
        }
    }

    /**
     * List all attachments for a specific booking with access control.
     */
    @Transactional(readOnly = true)
    public List<AttachmentDto> getAttachmentsForBooking(Long bookingId, Long currentUserId) {
        List<BookingAttachment> list = attachmentRepository.findByBookingId(bookingId);
        if (list.isEmpty()) {
            return Collections.emptyList();
        }

        // Verify access to booking
        verifyAccess(list.get(0), currentUserId);

        return list.stream().map(AttachmentDto::new).collect(Collectors.toList());
    }

    /**
     * Access control check:
     * - Admins & Inventory managers can access any attachment.
     * - Customer who created the booking or uploaded the photo can access.
     * - Assigned Handyman can access photos for their assigned jobs.
     */
    private void verifyAccess(BookingAttachment attachment, Long currentUserId) {
        if (currentUserId == null) {
            throw new AccessDeniedException("Authentication required to access image attachments");
        }

        if (SecurityUtils.hasRole("ROLE_ADMIN") || SecurityUtils.hasRole("ROLE_INVENTORY_MANAGER")) {
            return;
        }

        // If unlinked, only the uploader can view
        if (attachment.getBooking() == null) {
            if (attachment.getUploader().getId().equals(currentUserId)) {
                return;
            }
            throw new AccessDeniedException("Unauthorized to view this attachment");
        }

        // Booking customer
        Booking booking = attachment.getBooking();
        if (booking.getCustomer() != null && booking.getCustomer().getId().equals(currentUserId)) {
            return;
        }

        // Assigned handyman
        Optional<BookingAssignment> latestAssignment = assignmentRepository.findFirstByBookingIdOrderByAssignedAtDesc(booking.getId());
        if (latestAssignment.isPresent()) {
            BookingAssignment assignment = latestAssignment.get();
            if (assignment.getHandyman() != null && assignment.getHandyman().getUser() != null) {
                if (assignment.getHandyman().getUser().getId().equals(currentUserId)) {
                    return;
                }
            }
        }

        throw new AccessDeniedException("Unauthorized to view attachments for booking #" + booking.getBookingReference());
    }

    private void validateImageMagicBytes(MultipartFile file) {
        byte[] header = new byte[12];
        try (InputStream is = file.getInputStream()) {
            int read = is.read(header);
            if (read < 12) {
                throw new BadRequestException("File too small to be a valid image");
            }

            boolean isJpeg = (header[0] == (byte) 0xFF) && (header[1] == (byte) 0xD8) && (header[2] == (byte) 0xFF);
            boolean isPng = (header[0] == (byte) 0x89) && (header[1] == (byte) 0x50) && (header[2] == (byte) 0x4E)
                    && (header[3] == (byte) 0x47) && (header[4] == (byte) 0x0D) && (header[5] == (byte) 0x0A)
                    && (header[6] == (byte) 0x1A) && (header[7] == (byte) 0x0A);
            boolean isWebp = (header[0] == (byte) 'R') && (header[1] == (byte) 'I') && (header[2] == (byte) 'F')
                    && (header[3] == (byte) 'F') && (header[8] == (byte) 'W') && (header[9] == (byte) 'E')
                    && (header[10] == (byte) 'B') && (header[11] == (byte) 'P');

            if (!isJpeg && !isPng && !isWebp) {
                throw new BadRequestException("File content signature does not match a valid JPEG, PNG, or WebP image");
            }
        } catch (IOException e) {
            throw new BadRequestException("Could not read file header for image validation");
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1);
        }
        return "";
    }

    public static class AttachmentResourceResult {
        private final Resource resource;
        private final String contentType;
        private final String filename;

        public AttachmentResourceResult(Resource resource, String contentType, String filename) {
            this.resource = resource;
            this.contentType = contentType;
            this.filename = filename;
        }

        public Resource getResource() {
            return resource;
        }

        public String getContentType() {
            return contentType;
        }

        public String getFilename() {
            return filename;
        }
    }
}
