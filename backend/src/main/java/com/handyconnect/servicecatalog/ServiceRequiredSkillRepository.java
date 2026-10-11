package com.handyconnect.servicecatalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequiredSkillRepository extends JpaRepository<ServiceRequiredSkill, Long> {
    List<ServiceRequiredSkill> findByServiceId(Long serviceId);
    void deleteByServiceId(Long serviceId);
}
