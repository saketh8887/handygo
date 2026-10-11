package com.handyconnect.handyman;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HandymanServiceAreaRepository extends JpaRepository<HandymanServiceArea, Long> {
    List<HandymanServiceArea> findByHandymanId(Long handymanId);
    List<HandymanServiceArea> findByPostalCode(String postalCode);
    void deleteByHandymanId(Long handymanId);
}
