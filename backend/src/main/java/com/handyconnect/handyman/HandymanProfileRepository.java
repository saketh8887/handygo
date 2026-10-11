package com.handyconnect.handyman;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HandymanProfileRepository extends JpaRepository<HandymanProfile, Long> {
    Optional<HandymanProfile> findByUserId(Long userId);
    List<HandymanProfile> findByVerificationStatus(String verificationStatus);
    List<HandymanProfile> findByVerificationStatusAndActiveStatus(String verificationStatus, String activeStatus);
}
