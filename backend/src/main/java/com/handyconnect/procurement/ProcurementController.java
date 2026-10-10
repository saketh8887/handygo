package com.handyconnect.procurement;

import com.handyconnect.common.dto.ApiResponse;
import com.handyconnect.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/procurement")
@Tag(name = "Procurement and Logistics", description = "Purchase orders, replenishment recommendations, and stock transfers APIs")
public class ProcurementController {

    private final ProcurementService procurementService;

    public ProcurementController(ProcurementService procurementService) {
        this.procurementService = procurementService;
    }

    @GetMapping("/reorder-recommendations")
    @Operation(summary = "Get automated replenishment recommendations based on lead times and safety stock")
    public ResponseEntity<ApiResponse<List<ProcurementDto.ReorderRecommendationDto>>> getRecommendations() {
        return ResponseEntity.ok(ApiResponse.success(procurementService.calculateReorderRecommendations()));
    }

    @GetMapping("/requisitions")
    @Operation(summary = "Get all purchase requisitions")
    public ResponseEntity<ApiResponse<List<ProcurementDto.RequisitionDto>>> getRequisitions() {
        return ResponseEntity.ok(ApiResponse.success(procurementService.getAllRequisitions()));
    }

    @PostMapping("/requisitions")
    @Operation(summary = "Create purchase requisition")
    public ResponseEntity<ApiResponse<ProcurementDto.RequisitionDto>> createRequisition(@RequestBody Map<String, Object> body) {
        Long itemId = Long.valueOf(body.get("itemId").toString());
        Long locationId = Long.valueOf(body.get("locationId").toString());
        BigDecimal qty = new BigDecimal(body.get("suggestedQuantity").toString());
        String reason = body.getOrDefault("reason", "Stock replenishment").toString();
        Long userId = SecurityUtils.getCurrentUserId();

        return ResponseEntity.ok(ApiResponse.success("Requisition created", procurementService.createRequisition(itemId, locationId, qty, reason, userId)));
    }

    @PatchMapping("/requisitions/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin approves purchase requisition")
    public ResponseEntity<ApiResponse<ProcurementDto.RequisitionDto>> approveRequisition(@PathVariable Long id) {
        Long adminId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Requisition approved", procurementService.approveRequisition(id, adminId)));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get all purchase orders")
    public ResponseEntity<ApiResponse<List<ProcurementDto.PurchaseOrderDto>>> getOrders() {
        return ResponseEntity.ok(ApiResponse.success(procurementService.getAllOrders()));
    }

    @PostMapping("/orders")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Create purchase order for supplier")
    public ResponseEntity<ApiResponse<ProcurementDto.PurchaseOrderDto>> createOrder(@RequestBody Map<String, Object> body) {
        Long supplierId = Long.valueOf(body.get("supplierId").toString());
        Long destinationLocId = Long.valueOf(body.get("destinationLocationId").toString());
        List<Map<String, Object>> itemMaps = (List<Map<String, Object>>) body.get("items");

        List<ProcurementDto.POItemDto> items = itemMaps.stream().map(m -> {
            ProcurementDto.POItemDto item = new ProcurementDto.POItemDto();
            item.setItemId(Long.valueOf(m.get("itemId").toString()));
            item.setQuantity(new BigDecimal(m.get("quantity").toString()));
            item.setUnitPrice(new BigDecimal(m.get("unitPrice").toString()));
            return item;
        }).toList();

        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Order submitted", procurementService.createPurchaseOrder(supplierId, destinationLocId, items, userId)));
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Update purchase order status (SUBMITTED, CONFIRMED, DISPATCHED, DELIVERED)")
    public ResponseEntity<ApiResponse<ProcurementDto.PurchaseOrderDto>> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Order status updated", procurementService.updateOrderStatus(id, status, userId)));
    }

    @GetMapping("/transfers")
    @Operation(summary = "Get all warehouse stock transfers")
    public ResponseEntity<ApiResponse<List<ProcurementDto.StockTransferDto>>> getTransfers() {
        return ResponseEntity.ok(ApiResponse.success(procurementService.getAllTransfers()));
    }

    @PostMapping("/transfers")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Request stock transfer between warehouses")
    public ResponseEntity<ApiResponse<ProcurementDto.StockTransferDto>> requestTransfer(@RequestBody Map<String, Object> body) {
        Long itemId = Long.valueOf(body.get("itemId").toString());
        Long fromLocId = Long.valueOf(body.get("fromLocationId").toString());
        Long toLocId = Long.valueOf(body.get("toLocationId").toString());
        BigDecimal qty = new BigDecimal(body.get("quantity").toString());
        String reason = body.getOrDefault("reason", "Balancing regional stock demand").toString();
        Long userId = SecurityUtils.getCurrentUserId();

        return ResponseEntity.ok(ApiResponse.success("Transfer requested", procurementService.requestTransfer(itemId, fromLocId, toLocId, qty, reason, userId)));
    }

    @PostMapping("/transfers/{id}/execute")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Execute approved stock transfer")
    public ResponseEntity<ApiResponse<ProcurementDto.StockTransferDto>> executeTransfer(@PathVariable Long id) {
        Long adminId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Transfer executed", procurementService.executeTransfer(id, adminId)));
    }
}
