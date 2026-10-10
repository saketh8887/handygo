package com.handyconnect.inventory;

import com.handyconnect.common.dto.ApiResponse;
import com.handyconnect.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/inventory")
@PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
@Tag(name = "Inventory Management", description = "Stock balances, warehouse movements, goods receipt, and stock adjustment APIs")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/items")
    @Operation(summary = "Get all inventory items and materials")
    public ResponseEntity<ApiResponse<List<InventoryItemDto>>> getAllItems() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllItems()));
    }

    @GetMapping("/items/{id}")
    @Operation(summary = "Get inventory item details by ID")
    public ResponseEntity<ApiResponse<InventoryItemDto>> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getItemById(id)));
    }

    @GetMapping("/locations")
    @Operation(summary = "Get all warehouse and inventory locations")
    public ResponseEntity<ApiResponse<List<InventoryLocation>>> getAllLocations() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllLocations()));
    }

    @GetMapping("/balances")
    @Operation(summary = "Get current stock balances across all locations")
    public ResponseEntity<ApiResponse<List<InventoryBalanceDto>>> getAllBalances() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllBalances()));
    }

    @GetMapping("/alerts/low-stock")
    @Operation(summary = "Get items currently at or below their reorder point")
    public ResponseEntity<ApiResponse<List<InventoryBalanceDto>>> getLowStockAlerts() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getLowStockAlerts()));
    }

    @GetMapping("/movements")
    @Operation(summary = "Get immutable inventory movement ledger history")
    public ResponseEntity<ApiResponse<List<InventoryMovementDto>>> getMovements() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getMovementHistory()));
    }

    @PostMapping("/goods-receipt")
    @Operation(summary = "Record goods received from supplier")
    public ResponseEntity<ApiResponse<InventoryBalanceDto>> recordGoodsReceipt(@RequestBody Map<String, Object> req) {
        Long itemId = Long.valueOf(req.get("itemId").toString());
        Long locationId = Long.valueOf(req.get("locationId").toString());
        BigDecimal quantity = new BigDecimal(req.get("quantity").toString());
        String refId = req.getOrDefault("referenceId", "GR-" + System.currentTimeMillis()).toString();
        String reason = req.getOrDefault("reason", "Supplier delivery received").toString();
        Long userId = SecurityUtils.getCurrentUserId();

        InventoryBalanceDto result = inventoryService.goodsReceipt(itemId, locationId, quantity, refId, reason, userId);
        return ResponseEntity.ok(ApiResponse.success("Goods receipt recorded successfully", result));
    }

    @PostMapping("/adjust")
    @Operation(summary = "Adjust inventory count with mandatory reason")
    public ResponseEntity<ApiResponse<InventoryBalanceDto>> adjustStock(@Valid @RequestBody StockAdjustmentRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();
        InventoryBalanceDto result = inventoryService.adjustStock(req, userId);
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted successfully", result));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer stock between warehouses")
    public ResponseEntity<ApiResponse<String>> transferStock(@RequestBody Map<String, Object> req) {
        Long itemId = Long.valueOf(req.get("itemId").toString());
        Long fromLocId = Long.valueOf(req.get("fromLocationId").toString());
        Long toLocId = Long.valueOf(req.get("toLocationId").toString());
        BigDecimal quantity = new BigDecimal(req.get("quantity").toString());
        String transferNumber = req.getOrDefault("transferNumber", "TRF-" + System.currentTimeMillis()).toString();
        Long userId = SecurityUtils.getCurrentUserId();

        inventoryService.transferStock(itemId, fromLocId, toLocId, quantity, transferNumber, userId);
        return ResponseEntity.ok(ApiResponse.success("Stock transferred successfully", transferNumber));
    }
}
