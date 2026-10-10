package com.handyconnect.handyman;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HandymanSkillRepository extends JpaRepository<HandymanSkill, Long> {
    List<HandymanSkill> findByHandymanId(Long handymanId);
    List<HandymanSkill> findByCategoryId(Long categoryId);
}
