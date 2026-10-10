package com.handyconnect.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialReservationRepository extends JpaRepository<MaterialReservation, Long> {
    List<MaterialReservation> findByBookingId(Long bookingId);
    List<MaterialReservation> findByBookingIdAndStatus(Long bookingId, String status);
}
