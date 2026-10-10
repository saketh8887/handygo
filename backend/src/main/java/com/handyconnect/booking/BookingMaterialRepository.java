package com.handyconnect.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingMaterialRepository extends JpaRepository<BookingMaterial, Long> {
    List<BookingMaterial> findByBookingId(Long bookingId);
}
