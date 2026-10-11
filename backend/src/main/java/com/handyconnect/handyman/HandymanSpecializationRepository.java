package com.handyconnect.handyman;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HandymanSpecializationRepository extends JpaRepository<HandymanSpecialization, Long> {
    List<HandymanSpecialization> findByHandymanId(Long handymanId);
    List<HandymanSpecialization> findBySpecializationId(Long specializationId);
    List<HandymanSpecialization> findBySpecializationIdIn(Iterable<Long> specializationIds);
    void deleteByHandymanId(Long handymanId);
}
