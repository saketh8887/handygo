package com.handyconnect.procurement;

import com.handyconnect.common.exception.BadRequestException;
import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.inventory.*;
import com.handyconnect.supplier.Supplier;
import com.handyconnect.supplier.SupplierItem;
import com.handyconnect.supplier.SupplierItemRepository;
import com.handyconnect.supplier.SupplierRepository;
import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProcurementService {

    private final PurchaseRequisitionRepository requisitionRepository;
    private final PurchaseOrderRepository orderRepository;
    private final PurchaseOrderItemRepository orderItemRepository;
    private final StockTransferRepository transferRepository;
    private final InventoryItemRepository itemRepository;
    private final InventoryLocationRepository locationRepository;
    private final InventoryBalanceRepository balanceRepository;
    private final SupplierRepository supplierRepository;
    private final SupplierItemRepository supplierItemRepository;
    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    public ProcurementService(PurchaseRequisitionRepository requisitionRepository,
                              PurchaseOrderRepository orderRepository,
                              PurchaseOrderItemRepository orderItemRepository,
                              StockTransferRepository transferRepository,
                              InventoryItemRepository itemRepository,
                              InventoryLocationRepository locationRepository,
                              InventoryBalanceRepository balanceRepository,
                              SupplierRepository supplierRepository,
                              SupplierItemRepository supplierItemRepository,
                              InventoryService inventoryService,
                              UserRepository userRepository) {
        this.requisitionRepository = requisitionRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.transferRepository = transferRepository;
        this.itemRepository = itemRepository;
        this.locationRepository = locationRepository;
        this.balanceRepository = balanceRepository;
        this.supplierRepository = supplierRepository;
        this.supplierItemRepository = supplierItemRepository;
        this.inventoryService = inventoryService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ProcurementDto.ReorderRecommendationDto> calculateReorderRecommendations() {
        List<InventoryItem> items = itemRepository.findByIsActiveTrue();
        List<ProcurementDto.ReorderRecommendationDto> recommendations = new ArrayList<>();

        for (InventoryItem item : items) {
            List<InventoryBalance> balances = balanceRepository.findByItemId(item.getId());
            BigDecimal onHand = balances.stream().map(InventoryBalance::getQuantityOnHand).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal reserved = balances.stream().map(InventoryBalance::getReservedQuantity).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal available = onHand.subtract(reserved);

            // Reorder point = (Average Daily Demand * Supplier Lead Time) + Safety Stock
            // Configured / standard daily demand estimate based on reorder level
            BigDecimal avgDailyDemand = item.getReorderLevel().divide(BigDecimal.valueOf(10), 2, RoundingMode.HALF_UP);
            if (avgDailyDemand.compareTo(BigDecimal.ZERO) == 0) avgDailyDemand = BigDecimal.valueOf(1.5);

            int leadTimeDays = 3;
            List<SupplierItem> supplierItems = supplierItemRepository.findByItemId(item.getId());
            if (!supplierItems.isEmpty() && supplierItems.get(0).getStandardLeadTimeDays() != null) {
                leadTimeDays = supplierItems.get(0).getStandardLeadTimeDays();
            }

            BigDecimal leadTimeDemand = avgDailyDemand.multiply(BigDecimal.valueOf(leadTimeDays));
            BigDecimal reorderPoint = leadTimeDemand.add(item.getSafetyStock());

            if (available.compareTo(reorderPoint) <= 0) {
                ProcurementDto.ReorderRecommendationDto rec = new ProcurementDto.ReorderRecommendationDto();
                rec.setItemId(item.getId());
                rec.setItemSku(item.getSku());
                rec.setItemName(item.getName());
                rec.setCurrentStock(onHand);
                rec.setReservedStock(reserved);
                rec.setAvailableStock(available);
                rec.setSafetyStock(item.getSafetyStock());
                rec.setSupplierLeadTimeDays(leadTimeDays);
                rec.setAverageDailyDemand(avgDailyDemand);
                rec.setReorderPoint(reorderPoint);

                BigDecimal deficit = reorderPoint.subtract(available);
                BigDecimal orderQty = deficit.add(item.getSafetyStock()).setScale(0, RoundingMode.CEILING);
                rec.setRecommendedOrderQuantity(orderQty);

                // Multi-location sharing evaluation: Can another warehouse supply this without shortage?
                InventoryBalance candidateSource = balances.stream()
                        .filter(b -> b.getAvailableQuantity().compareTo(item.getSafetyStock().multiply(BigDecimal.valueOf(2))) > 0)
                        .findFirst()
                        .orElse(null);

                if (candidateSource != null && candidateSource.getLocation() != null) {
                    rec.setTransferPossible(true);
                    rec.setTransferSourceLocationId(candidateSource.getLocation().getId());
                    rec.setTransferSourceLocationName(candidateSource.getLocation().getName());
                    rec.setExplanation(String.format("Available (%.2f) below reorder point (%.2f). Transfer feasible from %s (has %.2f units).",
                            available, reorderPoint, candidateSource.getLocation().getName(), candidateSource.getAvailableQuantity()));
                } else {
                    rec.setTransferPossible(false);
                    rec.setExplanation(String.format("Available (%.2f) below reorder point (%.2f). No surplus at other hubs. Purchase recommendation: %.0f units.",
                            available, reorderPoint, orderQty));
                }

                recommendations.add(rec);
            }
        }

        return recommendations;
    }

    @Transactional
    public ProcurementDto.RequisitionDto createRequisition(Long itemId, Long locationId, BigDecimal quantity, String reason, Long userId) {
        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemId));
        InventoryLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryLocation", "id", locationId));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        String reqNum = "REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PurchaseRequisition pr = new PurchaseRequisition();
        pr.setRequisitionNumber(reqNum);
        pr.setItem(item);
        pr.setLocation(location);
        pr.setSuggestedQuantity(quantity);
        pr.setReason(reason);
        pr.setStatus("PENDING");
        pr.setCreatedBy(user);

        return new ProcurementDto.RequisitionDto(requisitionRepository.save(pr));
    }

    @Transactional
    public ProcurementDto.RequisitionDto approveRequisition(Long requisitionId, Long adminUserId) {
        PurchaseRequisition pr = requisitionRepository.findById(requisitionId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseRequisition", "id", requisitionId));
        User admin = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;

        pr.setStatus("APPROVED");
        pr.setApprovedBy(admin);
        return new ProcurementDto.RequisitionDto(requisitionRepository.save(pr));
    }

    @Transactional(readOnly = true)
    public List<ProcurementDto.RequisitionDto> getAllRequisitions() {
        return requisitionRepository.findAll().stream()
                .map(ProcurementDto.RequisitionDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProcurementDto.PurchaseOrderDto createPurchaseOrder(Long supplierId, Long destinationLocId, List<ProcurementDto.POItemDto> items, Long userId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
        InventoryLocation dest = locationRepository.findById(destinationLocId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryLocation", "id", destinationLocId));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        String poNum = "PO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(poNum);
        po.setSupplier(supplier);
        po.setDestinationLocation(dest);
        po.setStatus("SUBMITTED");
        po.setCreatedBy(user);
        po.setExpectedDeliveryDate(LocalDate.now().plusDays(supplier.getLeadTimeDays()));

        BigDecimal total = BigDecimal.ZERO;
        List<PurchaseOrderItem> poItems = new ArrayList<>();

        for (ProcurementDto.POItemDto itemDto : items) {
            InventoryItem item = itemRepository.findById(itemDto.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemDto.getItemId()));

            PurchaseOrderItem poi = new PurchaseOrderItem();
            poi.setPurchaseOrder(po);
            poi.setItem(item);
            poi.setQuantity(itemDto.getQuantity());
            poi.setUnitPrice(itemDto.getUnitPrice());
            poi.setReceivedQuantity(BigDecimal.ZERO);

            total = total.add(itemDto.getQuantity().multiply(itemDto.getUnitPrice()));
            poItems.add(poi);
        }

        po.setTotalAmount(total);
        po.setItems(poItems);

        PurchaseOrder saved = orderRepository.save(po);
        return mapToDto(saved);
    }

    @Transactional
    public ProcurementDto.PurchaseOrderDto updateOrderStatus(Long orderId, String newStatus, Long userId) {
        PurchaseOrder po = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", orderId));

        po.setStatus(newStatus.toUpperCase());

        // If DELIVERED, automatically intake goods into destination warehouse
        if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            po.setActualDeliveryDate(LocalDate.now());
            for (PurchaseOrderItem poi : po.getItems()) {
                poi.setReceivedQuantity(poi.getQuantity());
                inventoryService.goodsReceipt(
                        poi.getItem().getId(),
                        po.getDestinationLocation().getId(),
                        poi.getQuantity(),
                        po.getPoNumber(),
                        "Fulfilled via Purchase Order " + po.getPoNumber(),
                        userId
                );
            }
        }

        return mapToDto(orderRepository.save(po));
    }

    @Transactional(readOnly = true)
    public List<ProcurementDto.PurchaseOrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProcurementDto.StockTransferDto requestTransfer(Long itemId, Long fromLocId, Long toLocId, BigDecimal quantity, String reason, Long userId) {
        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemId));
        InventoryLocation fromLoc = locationRepository.findById(fromLocId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryLocation (From)", "id", fromLocId));
        InventoryLocation toLoc = locationRepository.findById(toLocId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryLocation (To)", "id", toLocId));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        String trfNum = "TRF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        StockTransfer st = new StockTransfer();
        st.setTransferNumber(trfNum);
        st.setItem(item);
        st.setFromLocation(fromLoc);
        st.setToLocation(toLoc);
        st.setQuantity(quantity);
        st.setReason(reason);
        st.setStatus("PENDING");
        st.setRequestedBy(user);
        st.setEstimatedCost(BigDecimal.valueOf(15.00)); // Sample transfer transport cost

        return new ProcurementDto.StockTransferDto(transferRepository.save(st));
    }

    @Transactional
    public ProcurementDto.StockTransferDto executeTransfer(Long transferId, Long adminUserId) {
        StockTransfer st = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", transferId));
        User admin = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;

        // Perform actual stock movement
        inventoryService.transferStock(st.getItem().getId(), st.getFromLocation().getId(), st.getToLocation().getId(), st.getQuantity(), st.getTransferNumber(), adminUserId);

        st.setStatus("COMPLETED");
        st.setApprovedBy(admin);
        st.setCompletedAt(LocalDateTime.now());

        return new ProcurementDto.StockTransferDto(transferRepository.save(st));
    }

    @Transactional(readOnly = true)
    public List<ProcurementDto.StockTransferDto> getAllTransfers() {
        return transferRepository.findAll().stream()
                .map(ProcurementDto.StockTransferDto::new)
                .collect(Collectors.toList());
    }

    private ProcurementDto.PurchaseOrderDto mapToDto(PurchaseOrder po) {
        ProcurementDto.PurchaseOrderDto dto = new ProcurementDto.PurchaseOrderDto(po);
        List<ProcurementDto.POItemDto> items = orderItemRepository.findByPurchaseOrderId(po.getId()).stream()
                .map(ProcurementDto.POItemDto::new)
                .collect(Collectors.toList());
        dto.setItems(items);
        return dto;
    }
}
