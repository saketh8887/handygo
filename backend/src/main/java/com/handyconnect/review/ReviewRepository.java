package com.handyconnect.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByBookingId(Long bookingId);
    List<Review> findByHandymanIdOrderByCreatedAtDesc(Long handymanId);
    List<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
