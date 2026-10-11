package com.handyconnect.team;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamSkillRepository extends JpaRepository<TeamSkill, Long> {
    List<TeamSkill> findByTeamId(Long teamId);
    Optional<TeamSkill> findByTeamIdAndSkillId(Long teamId, Long skillId);
    void deleteByTeamIdAndSkillId(Long teamId, Long skillId);
    boolean existsByTeamIdAndSkillId(Long teamId, Long skillId);
}
