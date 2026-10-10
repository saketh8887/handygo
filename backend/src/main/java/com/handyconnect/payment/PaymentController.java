package com.handyconnect.payment;

import com.handyconnect.common.dto.ApiResponse;
import com.handyconnect.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payments", description = "Simulated payment processing and history APIs")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    @Operation(summary = "Process a simulated payment with idempotency key")
    public ResponseEntity<ApiResponse<PaymentDto>> processPayment(@Valid @RequestBody PaymentRequest request) {
        Long customerId = SecurityUtils.getCurrentUserId();
        PaymentDto payment = paymentService.processPayment(request, customerId);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", payment));
    }

    @GetMapping("/my-payments")
    @Operation(summary = "Get payment history for currently authenticated customer")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getMyPayments() {
        Long customerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentsForCustomer(customerId)));
    }

    @GetMapping
    @Operation(summary = "Get all payments (Admin / Financial records)")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getAllPayments()));
    }
}
