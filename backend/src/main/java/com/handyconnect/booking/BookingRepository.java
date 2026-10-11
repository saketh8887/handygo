package com.handyconnect.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingReference(String bookingReference);
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Booking> findByStatus(BookingStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) FROM Booking b WHERE b.service.category.id = :categoryId")
    long countByCategoryId(@org.springframework.data.repository.query.Param("categoryId") Long categoryId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) FROM Booking b WHERE b.service.category.id = :categoryId AND b.status = :status")
    long countByCategoryIdAndStatus(@org.springframework.data.repository.query.Param("categoryId") Long categoryId, @org.springframework.data.repository.query.Param("status") BookingStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.service.category.id = :categoryId")
    List<Booking> findByCategoryId(@org.springframework.data.repository.query.Param("categoryId") Long categoryId);
}
