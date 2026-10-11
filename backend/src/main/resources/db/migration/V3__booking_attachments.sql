-- -------------------------------------------------------------
-- V3__booking_attachments.sql
-- Creates booking_attachments table for persistent image storage
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS booking_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NULL,
    uploader_user_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL UNIQUE,
    storage_path VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachment_uploader FOREIGN KEY (uploader_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_attachment_booking (booking_id),
    INDEX idx_attachment_uploader (uploader_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
