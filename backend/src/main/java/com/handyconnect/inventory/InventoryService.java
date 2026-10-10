package com.handyconnect.inventory;

import com.handyconnect.common.exception.BadRequestException;
import com.handyconnect.common.exception.InsufficientStockException;
import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryItemRepository itemRepository;
    private final InventoryLocationRepository locationRepository;
    private final InventoryBalanceRepository balanceRepository;
    private final InventoryMovementRepository movementRepository;
    private final MaterialReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public InventoryService(InventoryItemRepository itemRepository,
                            InventoryLocationRepository locationRepository,
                            InventoryBalanceRepository balanceRepository,
                            InventoryMovementRepository movementRepository,
                            MaterialReservationRepository reservationRepository,
                            UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.locationRepository = locationRepository;
        this.balanceRepository = balanceRepository;
        this.movementRepository = movementRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryItemDto> getAllItems() {
        return itemRepository.findAll().stream().map(item -> {
            InventoryItemDto dto = new InventoryItemDto(item);
            List<InventoryBalance> balances = balanceRepository.findByItemId(item.getId());
            BigDecimal onHand = balances.stream().map(InventoryBalance::getQuantityOnHand).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal reserved = balances.stream().map(InventoryBalance::getReservedQuantity).reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setTotalOnHand(onHand);
            dto.setTotalReserved(reserved);
            dto.setTotalAvailable(onHand.subtract(reserved));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InventoryItemDto getItemById(Long id) {
        InventoryItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));
        InventoryItemDto dto = new InventoryItemDto(item);
        List<InventoryBalance> balances = balanceRepository.findByItemId(item.getId());
        BigDecimal onHand = balances.stream().map(InventoryBalance::getQuantityOnHand).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal reserved = balances.stream().map(InventoryBalance::getReservedQuantity).reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalOnHand(onHand);
        dto.setTotalReserved(reserved);
        dto.setTotalAvailable(onHand.subtract(reserved));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<InventoryLocation> getAllLocations() {
        return locationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<InventoryBalanceDto> getAllBalances() {
        return balanceRepository.findAll().stream()
                .map(InventoryBalanceDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryBalanceDto> getLowStockAlerts() {
        return balanceRepository.findLowStockBalances().stream()
                .map(InventoryBalanceDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryMovementDto> getMovementHistory() {
        return movementRepository.findTop100ByOrderByTimestampDesc().stream()
                .map(InventoryMovementDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public InventoryBalanceDto goodsReceipt(Long itemId, Long locationId, BigDecimal quantity, String referenceId, String reason, Long userId) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Receipt quantity must be greater than zero");
        }

        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemId));
        InventoryLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryLocation", "id", locationId));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        InventoryBalance balance = balanceRepository.findByItemIdAndLocationIdWithLock(itemId, locationId)
                .orElseGet(() -> new InventoryBalance(item, location, BigDecimal.ZERO, BigDecimal.ZERO));

        balance.setQuantityOnHand(balance.getQuantityOnHand().add(quantity));
        InventoryBalance saved = balanceRepository.save(balance);

        InventoryMovement movement = new InventoryMovement(
                item, location, "GOODS_RECEIPT", quantity, saved.getQuantityOnHand(),
                "PURCHASE_ORDER", referenceId != null ? referenceId : "GR-" + System.currentTimeMillis(),
                reason != null ? reason : "Supplier goods received into warehouse", user
        );
        movementRepository.save(movement);

        return new InventoryBalanceDto(saved);
    }

    @Transactional
    public MaterialReservation reserveMaterial(Long bookingId, Long itemId, Long locationId, BigDecimal quantity) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Reservation quantity must be greater than zero");
        }

        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemId));
        InventoryLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryLocation", "id", locationId));

        InventoryBalance balance = balanceRepository.findByItemIdAndLocationIdWithLock(itemId, locationId)
                .orElseThrow(() -> new InsufficientStockException(item.getSku(), quantity.doubleValue(), 0.0));

        BigDecimal available = balance.getAvailableQuantity();
        if (available.compareTo(quantity) < 0) {
            throw new InsufficientStockException(item.getSku(), quantity.doubleValue(), available.doubleValue());
        }

        balance.setReservedQuantity(balance.getReservedQuantity().add(quantity));
        balanceRepository.save(balance);

        MaterialReservation reservation = new MaterialReservation(bookingId, item, location, quantity);
        MaterialReservation savedReservation = reservationRepository.save(reservation);

        InventoryMovement movement = new InventoryMovement(
                item, location, "RESERVATION", quantity, balance.getQuantityOnHand(),
                "BOOKING", "BK-" + bookingId, "Material reserved for booking #" + bookingId, null
        );
        movementRepository.save(movement);

        return savedReservation;
    }

    @Transactional
    public void issueMaterial(Long bookingId, Long itemId, Long locationId, BigDecimal quantity, Long userId) {
        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemId));
        InventoryLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryLocation", "id", locationId));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        InventoryBalance balance = balanceRepository.findByItemIdAndLocationIdWithLock(itemId, locationId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryBalance not found"));

        if (balance.getQuantityOnHand().compareTo(quantity) < 0) {
            throw new InsufficientStockException(item.getSku(), quantity.doubleValue(), balance.getQuantityOnHand().doubleValue());
        }

        // Deduct from on hand and release reserved
        balance.setQuantityOnHand(balance.getQuantityOnHand().subtract(quantity));
        BigDecimal newReserved = balance.getReservedQuantity().subtract(quantity);
        balance.setReservedQuantity(newReserved.compareTo(BigDecimal.ZERO) >= 0 ? newReserved : BigDecimal.ZERO);
        balanceRepository.save(balance);

        // Update reservation status if present
        List<MaterialReservation> reservations = reservationRepository.findByBookingIdAndStatus(bookingId, "ACTIVE");
        for (MaterialReservation res : reservations) {
            if (res.getItem().getId().equals(itemId)) {
                res.setStatus("FULFILLED");
                res.setFulfilledAt(LocalDateTime.now());
                reservationRepository.save(res);
            }
        }

        InventoryMovement movement = new InventoryMovement(
                item, location, "ISSUE", quantity, balance.getQuantityOnHand(),
                "BOOKING", "BK-" + bookingId, "Material issued to handyman for booking #" + bookingId, user
        );
        movementRepository.save(movement);
    }

    @Transactional
    public void recordConsumption(Long bookingId, Long itemId, Long locationId, BigDecimal usedQty, BigDecimal returnedQty, Long userId) {
        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemId));
        InventoryLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryLocation", "id", locationId));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        // If items are returned, add them back to quantity on hand
        if (returnedQty != null && returnedQty.compareTo(BigDecimal.ZERO) > 0) {
            InventoryBalance balance = balanceRepository.findByItemIdAndLocationIdWithLock(itemId, locationId)
                    .orElseGet(() -> new InventoryBalance(item, location, BigDecimal.ZERO, BigDecimal.ZERO));
            balance.setQuantityOnHand(balance.getQuantityOnHand().add(returnedQty));
            balanceRepository.save(balance);

            InventoryMovement movement = new InventoryMovement(
                    item, location, "RETURN", returnedQty, balance.getQuantityOnHand(),
                    "BOOKING", "BK-" + bookingId, "Unused material returned to inventory from booking #" + bookingId, user
            );
            movementRepository.save(movement);
        }

        if (usedQty != null && usedQty.compareTo(BigDecimal.ZERO) > 0) {
            InventoryBalance balance = balanceRepository.findByItemIdAndLocationId(itemId, locationId)
                    .orElseGet(() -> new InventoryBalance(item, location, BigDecimal.ZERO, BigDecimal.ZERO));

            InventoryMovement movement = new InventoryMovement(
                    item, location, "CONSUMPTION", usedQty, balance.getQuantityOnHand(),
                    "BOOKING", "BK-" + bookingId, "Material consumed during job execution for booking #" + bookingId, user
            );
            movementRepository.save(movement);
        }
    }

    @Transactional
    public InventoryBalanceDto adjustStock(StockAdjustmentRequest req, Long userId) {
        if (req.getReason() == null || req.getReason().trim().length() < 3) {
            throw new BadRequestException("A valid adjustment reason is mandatory");
        }

        InventoryItem item = itemRepository.findById(req.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", req.getItemId()));
        InventoryLocation location = locationRepository.findById(req.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("InventoryLocation", "id", req.getLocationId()));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        InventoryBalance balance = balanceRepository.findByItemIdAndLocationIdWithLock(req.getItemId(), req.getLocationId())
                .orElseGet(() -> new InventoryBalance(item, location, BigDecimal.ZERO, BigDecimal.ZERO));

        BigDecimal diff = req.getNewQuantityOnHand().subtract(balance.getQuantityOnHand());
        balance.setQuantityOnHand(req.getNewQuantityOnHand());
        InventoryBalance saved = balanceRepository.save(balance);

        InventoryMovement movement = new InventoryMovement(
                item, location, "ADJUSTMENT", diff, saved.getQuantityOnHand(),
                "ADJUSTMENT", req.getReferenceId() != null ? req.getReferenceId() : "ADJ-" + System.currentTimeMillis(),
                req.getReason(), user
        );
        movementRepository.save(movement);

        return new InventoryBalanceDto(saved);
    }

    @Transactional
    public void transferStock(Long itemId, Long fromLocationId, Long toLocationId, BigDecimal quantity, String transferNumber, Long userId) {
        if (fromLocationId.equals(toLocationId)) {
            throw new BadRequestException("Source and destination locations cannot be identical");
        }
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Transfer quantity must be greater than zero");
        }

        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemId));
        InventoryLocation fromLoc = locationRepository.findById(fromLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryLocation (Source)", "id", fromLocationId));
        InventoryLocation toLoc = locationRepository.findById(toLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryLocation (Destination)", "id", toLocationId));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        InventoryBalance fromBalance = balanceRepository.findByItemIdAndLocationIdWithLock(itemId, fromLocationId)
                .orElseThrow(() -> new InsufficientStockException(item.getSku(), quantity.doubleValue(), 0.0));

        BigDecimal available = fromBalance.getAvailableQuantity();
        if (available.compareTo(quantity) < 0) {
            throw new InsufficientStockException(item.getSku(), quantity.doubleValue(), available.doubleValue());
        }

        // Deduct from source
        fromBalance.setQuantityOnHand(fromBalance.getQuantityOnHand().subtract(quantity));
        balanceRepository.save(fromBalance);

        // Add to destination
        InventoryBalance toBalance = balanceRepository.findByItemIdAndLocationIdWithLock(itemId, toLocationId)
                .orElseGet(() -> new InventoryBalance(item, toLoc, BigDecimal.ZERO, BigDecimal.ZERO));
        toBalance.setQuantityOnHand(toBalance.getQuantityOnHand().add(quantity));
        balanceRepository.save(toBalance);

        // Log movement OUT
        movementRepository.save(new InventoryMovement(
                item, fromLoc, "TRANSFER_OUT", quantity.negate(), fromBalance.getQuantityOnHand(),
                "STOCK_TRANSFER", transferNumber, "Stock transfer out to " + toLoc.getName(), user
        ));

        // Log movement IN
        movementRepository.save(new InventoryMovement(
                item, toLoc, "TRANSFER_IN", quantity, toBalance.getQuantityOnHand(),
                "STOCK_TRANSFER", transferNumber, "Stock transfer in from " + fromLoc.getName(), user
        ));
    }
}
