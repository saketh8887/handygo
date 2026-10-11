package com.handyconnect.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingAssignmentRepository extends JpaRepository<BookingAssignment, Long> {
    List<BookingAssignment> findByBookingId(Long bookingId);
    List<BookingAssignment> findByHandymanIdOrderByAssignedAtDesc(Long handymanId);
    Optional<BookingAssignment> findByBookingIdAndHandymanId(Long bookingId, Long handymanId);
    Optional<BookingAssignment> findFirstByBookingIdOrderByAssignedAtDesc(Long bookingId);

    @Query("SELECT COUNT(ba) FROM BookingAssignment ba JOIN ba.booking b " +
           "WHERE ba.handyman.id = :handymanId " +
           "AND ba.assignmentStatus IN ('PENDING', 'ACCEPTED') " +
           "AND b.status NOT IN ('COMPLETED', 'CANCELLED', 'REJECTED')")
    long countActiveJobsForHandyman(@Param("handymanId") Long handymanId);

    @Query("SELECT ba FROM BookingAssignment ba JOIN ba.booking b " +
           "WHERE ba.handyman.id = :handymanId " +
           "AND b.scheduledDate = :date " +
           "AND b.scheduledTimeSlot = :slot " +
           "AND ba.assignmentStatus IN ('PENDING', 'ACCEPTED') " +
           "AND b.status NOT IN ('COMPLETED', 'CANCELLED', 'REJECTED')")
    List<BookingAssignment> findConflictingAssignments(@Param("handymanId") Long handymanId,
                                                      @Param("date") LocalDate date,
                                                      @Param("slot") String slot);
}
