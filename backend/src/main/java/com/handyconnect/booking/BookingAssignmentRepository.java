package com.handyconnect.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingAssignmentRepository extends JpaRepository<BookingAssignment, Long> {
    List<BookingAssignment> findByBookingId(Long bookingId);
    List<BookingAssignment> findByHandymanIdOrderByAssignedAtDesc(Long handymanId);
    Optional<BookingAssignment> findByBookingIdAndHandymanId(Long bookingId, Long handymanId);
    Optional<BookingAssignment> findFirstByBookingIdOrderByAssignedAtDesc(Long bookingId);
}
