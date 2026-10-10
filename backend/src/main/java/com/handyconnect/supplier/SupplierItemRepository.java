package com.handyconnect.supplier;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierItemRepository extends JpaRepository<SupplierItem, Long> {
    List<SupplierItem> findBySupplierId(Long supplierId);
    List<SupplierItem> findByItemId(Long itemId);
    Optional<SupplierItem> findBySupplierIdAndItemId(Long supplierId, Long itemId);
}
