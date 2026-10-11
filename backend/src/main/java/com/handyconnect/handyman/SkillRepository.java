package com.handyconnect.handyman;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByIsActiveTrueOrderByNameAsc();
    List<Skill> findBySpecializationIdAndIsActiveTrueOrderByNameAsc(Long specializationId);
    Optional<Skill> findByCode(String code);
    boolean existsByCode(String code);
}
