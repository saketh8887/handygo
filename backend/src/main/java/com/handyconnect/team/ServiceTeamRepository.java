package com.handyconnect.team;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceTeamRepository extends JpaRepository<ServiceTeam, Long> {
    Optional<ServiceTeam> findByCode(String code);
    List<ServiceTeam> findByIsActiveTrue();
    boolean existsByNameIgnoreCase(String name);
    boolean existsByCodeIgnoreCase(String code);
}
