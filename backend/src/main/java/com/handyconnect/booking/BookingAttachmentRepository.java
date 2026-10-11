package com.handyconnect.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingAttachmentRepository extends JpaRepository<BookingAttachment, Long> {
    List<BookingAttachment> findByBookingId(Long bookingId);
    List<BookingAttachment> findByUploaderIdAndBookingIsNull(Long uploaderId);
    List<BookingAttachment> findByIdIn(List<Long> ids);
    Optional<BookingAttachment> findByIdAndUploaderId(Long id, Long uploaderId);
}
