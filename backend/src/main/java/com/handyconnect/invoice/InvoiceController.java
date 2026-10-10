package com.handyconnect.invoice;

import com.handyconnect.common.dto.ApiResponse;
import com.handyconnect.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@Tag(name = "Invoices", description = "Invoice and billing management APIs")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get invoice for a specific booking")
    public ResponseEntity<ApiResponse<InvoiceDto>> getInvoiceByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceByBookingId(bookingId)));
    }

    @GetMapping("/my-invoices")
    @Operation(summary = "Get invoices for authenticated customer")
    public ResponseEntity<ApiResponse<List<InvoiceDto>>> getMyInvoices() {
        Long customerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoicesForCustomer(customerId)));
    }

    @GetMapping
    @Operation(summary = "Get all invoices (Admin)")
    public ResponseEntity<ApiResponse<List<InvoiceDto>>> getAllInvoices() {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getAllInvoices()));
    }
}
