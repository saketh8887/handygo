package com.handyconnect.procurement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRequisitionRepository extends JpaRepository<PurchaseRequisition, Long> {
    Optional<PurchaseRequisition> findByRequisitionNumber(String requisitionNumber);
    List<PurchaseRequisition> findByStatus(String status);
}
