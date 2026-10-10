package com.handyconnect.payment;

import com.handyconnect.booking.Booking;
import com.handyconnect.booking.BookingRepository;
import com.handyconnect.common.exception.BadRequestException;
import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.invoice.Invoice;
import com.handyconnect.invoice.InvoiceRepository;
import com.handyconnect.invoice.InvoiceService;
import com.handyconnect.notification.NotificationService;
import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          InvoiceRepository invoiceRepository,
                          InvoiceService invoiceService,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceService = invoiceService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public PaymentDto processPayment(PaymentRequest req, Long customerUserId) {
        // Idempotency check
        if (req.getIdempotencyKey() != null && !req.getIdempotencyKey().isBlank()) {
            var existing = paymentRepository.findByIdempotencyKey(req.getIdempotencyKey());
            if (existing.isPresent()) {
                return new PaymentDto(existing.get());
            }
        }

        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", req.getBookingId()));

        User customer = userRepository.findById(customerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerUserId));

        if (!booking.getCustomer().getId().equals(customerUserId)) {
            throw new BadRequestException("Booking does not belong to the authenticated customer");
        }

        String datePrefix = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String paymentRef = "PAY-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String txId = "TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

        Payment payment = new Payment();
        payment.setPaymentReference(paymentRef);
        payment.setBooking(booking);
        payment.setCustomer(customer);
        payment.setAmount(req.getAmount());
        payment.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "SIMULATED_CARD");
        payment.setStatus("SUCCESSFUL");
        payment.setTransactionId(txId);
        payment.setIdempotencyKey(req.getIdempotencyKey() != null ? req.getIdempotencyKey() : UUID.randomUUID().toString());

        Payment savedPayment = paymentRepository.save(payment);

        // Update corresponding invoice to PAID
        Invoice invoice = invoiceRepository.findByBookingId(booking.getId())
                .orElseGet(() -> invoiceService.createInvoiceForBooking(booking));
        invoiceService.markInvoicePaid(invoice, savedPayment);

        notificationService.createNotification(customer, "Payment Successful",
                "Payment of $" + req.getAmount() + " for " + booking.getBookingReference() + " completed successfully. Ref: " + paymentRef,
                "PAYMENT", "PAYMENT", savedPayment.getId().toString());

        return new PaymentDto(savedPayment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentsForCustomer(Long customerId) {
        return paymentRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(PaymentDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(PaymentDto::new)
                .collect(Collectors.toList());
    }
}
