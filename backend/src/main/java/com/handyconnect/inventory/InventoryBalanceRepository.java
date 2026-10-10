package com.handyconnect.inventory;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryBalanceRepository extends JpaRepository<InventoryBalance, Long> {

    Optional<InventoryBalance> findByItemIdAndLocationId(Long itemId, Long locationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM InventoryBalance b WHERE b.item.id = :itemId AND b.location.id = :locationId")
    Optional<InventoryBalance> findByItemIdAndLocationIdWithLock(@Param("itemId") Long itemId, @Param("locationId") Long locationId);

    List<InventoryBalance> findByItemId(Long itemId);

    List<InventoryBalance> findByLocationId(Long locationId);

    @Query("SELECT b FROM InventoryBalance b WHERE (b.quantityOnHand - b.reservedQuantity) <= b.item.reorderLevel")
    List<InventoryBalance> findLowStockBalances();
}
