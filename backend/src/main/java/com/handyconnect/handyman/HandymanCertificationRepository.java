package com.handyconnect.handyman;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HandymanCertificationRepository extends JpaRepository<HandymanCertification, Long> {
    List<HandymanCertification> findByHandymanId(Long handymanId);
    List<HandymanCertification> findByVerificationStatus(String verificationStatus);
}
