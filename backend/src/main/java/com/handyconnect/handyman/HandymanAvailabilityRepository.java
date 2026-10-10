package com.handyconnect.handyman;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HandymanAvailabilityRepository extends JpaRepository<HandymanAvailability, Long> {
    List<HandymanAvailability> findByHandymanId(Long handymanId);
    List<HandymanAvailability> findByHandymanIdAndDayOfWeek(Long handymanId, String dayOfWeek);
}
