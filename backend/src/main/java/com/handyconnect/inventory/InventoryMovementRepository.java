package com.handyconnect.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    List<InventoryMovement> findByItemIdOrderByTimestampDesc(Long itemId);
    List<InventoryMovement> findByLocationIdOrderByTimestampDesc(Long locationId);
    List<InventoryMovement> findTop100ByOrderByTimestampDesc();
}
