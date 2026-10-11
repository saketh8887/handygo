package com.handyconnect.servicecatalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    Optional<ServiceCategory> findByCode(String code);
    boolean existsByName(String name);
    boolean existsByCode(String code);
    List<ServiceCategory> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<ServiceCategory> findAllByOrderByDisplayOrderAsc();
}
