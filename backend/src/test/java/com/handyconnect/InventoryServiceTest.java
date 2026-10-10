package com.handyconnect;

import com.handyconnect.common.exception.InsufficientStockException;
import com.handyconnect.inventory.*;
import com.handyconnect.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryItemRepository itemRepository;

    @Mock
    private InventoryLocationRepository locationRepository;

    @Mock
    private InventoryBalanceRepository balanceRepository;

    @Mock
    private InventoryMovementRepository movementRepository;

    @Mock
    private MaterialReservationRepository reservationRepository;

    @Mock
    private UserRepository userRepository;

    private InventoryService inventoryService;

    @BeforeEach
    void setUp() {
        inventoryService = new InventoryService(
                itemRepository, locationRepository, balanceRepository,
                movementRepository, reservationRepository, userRepository
        );
    }

    @Test
    void testReserveMaterialSuccess() {
        InventoryItem item = new InventoryItem();
        item.setId(1L);
        item.setSku("PLUMB-PEX-01");
        item.setName("PEX Pipe");

        InventoryLocation location = new InventoryLocation();
        location.setId(1L);
        location.setCode("LOC-CENTRAL");

        InventoryBalance balance = new InventoryBalance(item, location, BigDecimal.valueOf(50.0), BigDecimal.valueOf(10.0));
        // Available: 50 - 10 = 40

        when(itemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(location));
        when(balanceRepository.findByItemIdAndLocationIdWithLock(1L, 1L)).thenReturn(Optional.of(balance));
        when(balanceRepository.save(any(InventoryBalance.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reservationRepository.save(any(MaterialReservation.class))).thenAnswer(inv -> inv.getArgument(0));

        MaterialReservation res = inventoryService.reserveMaterial(101L, 1L, 1L, BigDecimal.valueOf(5.0));

        assertNotNull(res);
        assertEquals(BigDecimal.valueOf(15.0), balance.getReservedQuantity());
        verify(movementRepository, times(1)).save(any(InventoryMovement.class));
    }

    @Test
    void testReserveMaterialThrowsInsufficientStock() {
        InventoryItem item = new InventoryItem();
        item.setId(1L);
        item.setSku("PLUMB-PEX-01");

        InventoryLocation location = new InventoryLocation();
        location.setId(1L);

        InventoryBalance balance = new InventoryBalance(item, location, BigDecimal.valueOf(10.0), BigDecimal.valueOf(8.0));
        // Available: 10 - 8 = 2

        when(itemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(location));
        when(balanceRepository.findByItemIdAndLocationIdWithLock(1L, 1L)).thenReturn(Optional.of(balance));

        assertThrows(InsufficientStockException.class, () ->
                inventoryService.reserveMaterial(101L, 1L, 1L, BigDecimal.valueOf(5.0))
        );

        verify(movementRepository, never()).save(any(InventoryMovement.class));
    }
}
