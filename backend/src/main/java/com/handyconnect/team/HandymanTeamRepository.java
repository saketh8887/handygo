package com.handyconnect.team;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HandymanTeamRepository extends JpaRepository<HandymanTeam, Long> {
    List<HandymanTeam> findByTeamId(Long teamId);
    List<HandymanTeam> findByHandymanId(Long handymanId);
    Optional<HandymanTeam> findByHandymanIdAndTeamId(Long handymanId, Long teamId);
    List<HandymanTeam> findByHandymanIdAndApprovalStatus(Long handymanId, String approvalStatus);
    List<HandymanTeam> findByTeamIdAndApprovalStatus(Long teamId, String approvalStatus);
    List<HandymanTeam> findByTeamIdInAndApprovalStatus(Iterable<Long> teamIds, String approvalStatus);

    @Modifying
    @Query("DELETE FROM HandymanTeam ht WHERE ht.handyman.id = :handymanId AND ht.team.id = :teamId")
    void deleteByHandymanIdAndTeamId(@Param("handymanId") Long handymanId, @Param("teamId") Long teamId);

    long countByTeamIdAndApprovalStatus(Long teamId, String approvalStatus);
}
