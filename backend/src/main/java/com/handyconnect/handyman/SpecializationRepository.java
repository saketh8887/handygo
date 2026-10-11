package com.handyconnect.handyman;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecializationRepository extends JpaRepository<Specialization, Long> {
    List<Specialization> findByIsActiveTrueOrderByNameAsc();
    Optional<Specialization> findByCode(String code);
    boolean existsByCode(String code);
}
