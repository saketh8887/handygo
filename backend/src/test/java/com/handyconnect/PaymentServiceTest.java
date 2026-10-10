package com.handyconnect;

import com.handyconnect.booking.Booking;
import com.handyconnect.booking.BookingRepository;
import com.handyconnect.invoice.Invoice;
import com.handyconnect.invoice.InvoiceRepository;
import com.handyconnect.invoice.InvoiceService;
import com.handyconnect.notification.NotificationService;
import com.handyconnect.payment.*;
import com.handyconnect.servicecatalog.ServiceEntity;
import com.handyconnect.user.User;
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
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private InvoiceService invoiceService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationService notificationService;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                paymentRepository, bookingRepository, invoiceRepository,
                invoiceService, userRepository, notificationService
        );
    }

    @Test
    void testProcessPaymentSuccess() {
        User customer = new User();
        customer.setId(2L);
        customer.setFullName("Demo Customer");

        ServiceEntity service = new ServiceEntity();
        service.setName("Pipe Leak");
        service.setIndicativeBasePrice(BigDecimal.valueOf(65.0));

        Booking booking = new Booking();
        booking.setId(10L);
        booking.setCustomer(customer);
        booking.setService(service);
        booking.setBookingReference("BK-TEST-001");

        when(userRepository.findById(2L)).thenReturn(Optional.of(customer));
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(100L);
            return p;
        });

        Invoice inv = new Invoice();
        inv.setId(50L);
        when(invoiceRepository.findByBookingId(10L)).thenReturn(Optional.of(inv));

        PaymentRequest req = new PaymentRequest();
        req.setBookingId(10L);
        req.setAmount(BigDecimal.valueOf(98.0));
        req.setPaymentMethod("SIMULATED_CARD");
        req.setIdempotencyKey("KEY-12345");

        PaymentDto result = paymentService.processPayment(req, 2L);

        assertNotNull(result);
        assertEquals("SUCCESSFUL", result.getStatus());
        assertEquals(BigDecimal.valueOf(98.0), result.getAmount());
        verify(invoiceService, times(1)).markInvoicePaid(any(Invoice.class), any(Payment.class));
    }

    @Test
    void testIdempotencyReturnsExistingPaymentWithoutDoubleCharge() {
        Payment existingPayment = new Payment();
        existingPayment.setId(99L);
        existingPayment.setPaymentReference("PAY-EXISTING-001");
        existingPayment.setStatus("SUCCESSFUL");
        existingPayment.setAmount(BigDecimal.valueOf(98.0));
        existingPayment.setIdempotencyKey("KEY-DUPLICATE");

        when(paymentRepository.findByIdempotencyKey("KEY-DUPLICATE")).thenReturn(Optional.of(existingPayment));

        PaymentRequest req = new PaymentRequest();
        req.setBookingId(10L);
        req.setAmount(BigDecimal.valueOf(98.0));
        req.setIdempotencyKey("KEY-DUPLICATE");

        PaymentDto result = paymentService.processPayment(req, 2L);

        assertNotNull(result);
        assertEquals(99L, result.getId());
        assertEquals("PAY-EXISTING-001", result.getPaymentReference());
        verify(paymentRepository, never()).save(any(Payment.class));
    }
}
