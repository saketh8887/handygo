package com.handyconnect;

import com.handyconnect.inventory.InventoryBalance;
import com.handyconnect.inventory.InventoryBalanceRepository;
import com.handyconnect.inventory.InventoryItem;
import com.handyconnect.inventory.InventoryItemRepository;
import com.handyconnect.inventory.InventoryLocation;
import com.handyconnect.inventory.InventoryLocationRepository;
import com.handyconnect.inventory.InventoryService;
import com.handyconnect.procurement.*;
import com.handyconnect.supplier.SupplierItem;
import com.handyconnect.supplier.SupplierItemRepository;
import com.handyconnect.supplier.SupplierRepository;
import com.handyconnect.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {

    @Mock
    private PurchaseRequisitionRepository requisitionRepository;
    @Mock
    private PurchaseOrderRepository orderRepository;
    @Mock
    private PurchaseOrderItemRepository orderItemRepository;
    @Mock
    private StockTransferRepository transferRepository;
    @Mock
    private InventoryItemRepository itemRepository;
    @Mock
    private InventoryLocationRepository locationRepository;
    @Mock
    private InventoryBalanceRepository balanceRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private SupplierItemRepository supplierItemRepository;
    @Mock
    private InventoryService inventoryService;
    @Mock
    private UserRepository userRepository;

    private ProcurementService procurementService;

    @BeforeEach
    void setUp() {
        procurementService = new ProcurementService(
                requisitionRepository, orderRepository, orderItemRepository, transferRepository,
                itemRepository, locationRepository, balanceRepository, supplierRepository,
                supplierItemRepository, inventoryService, userRepository
        );
    }

    @Test
    void testCalculateReorderRecommendationsWhenStockBelowROP() {
        InventoryItem item = new InventoryItem();
        item.setId(10L);
        item.setSku("ELECT-MCB-16");
        item.setName("16A Circuit Breaker");
        item.setReorderLevel(BigDecimal.valueOf(20.0));
        item.setSafetyStock(BigDecimal.valueOf(5.0));
        when(itemRepository.findByIsActiveTrue()).thenReturn(List.of(item));

        InventoryLocation central = new InventoryLocation();
        central.setId(1L);
        central.setCode("LOC-CENTRAL");

        // Stock available is 4 (below ROP)
        InventoryBalance bal = new InventoryBalance(item, central, BigDecimal.valueOf(4.0), BigDecimal.ZERO);
        when(balanceRepository.findByItemId(10L)).thenReturn(List.of(bal));

        SupplierItem si = new SupplierItem();
        si.setStandardLeadTimeDays(3);
        when(supplierItemRepository.findByItemId(10L)).thenReturn(List.of(si));

        List<ProcurementDto.ReorderRecommendationDto> recs = procurementService.calculateReorderRecommendations();

        assertNotNull(recs);
        assertEquals(1, recs.size());
        assertEquals("ELECT-MCB-16", recs.get(0).getItemSku());
        assertTrue(recs.get(0).getRecommendedOrderQuantity().doubleValue() > 0);
    }
}
