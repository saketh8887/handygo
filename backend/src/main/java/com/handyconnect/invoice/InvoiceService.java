package com.handyconnect.invoice;

import com.handyconnect.booking.Booking;
import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.payment.Payment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional
    public Invoice createInvoiceForBooking(Booking booking) {
        return invoiceRepository.findByBookingId(booking.getId()).orElseGet(() -> {
            String datePrefix = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
            String invNum = "INV-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

            BigDecimal base = booking.getService().getIndicativeBasePrice();
            BigDecimal materials = booking.getMaterialsAmount() != null ? booking.getMaterialsAmount() : BigDecimal.ZERO;
            BigDecimal subtotal = base.add(materials);
            BigDecimal tax = subtotal.multiply(new BigDecimal("0.08")); // 8% sample tax
            BigDecimal total = subtotal.add(tax);

            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber(invNum);
            invoice.setBooking(booking);
            invoice.setCustomer(booking.getCustomer());
            invoice.setBaseServiceAmount(base);
            invoice.setMaterialsAmount(materials);
            invoice.setTaxAmount(tax);
            invoice.setTotalAmount(total);
            invoice.setStatus("ISSUED");
            invoice.setIssuedAt(LocalDateTime.now());

            return invoiceRepository.save(invoice);
        });
    }

    @Transactional(readOnly = true)
    public InvoiceDto getInvoiceByBookingId(Long bookingId) {
        Invoice invoice = invoiceRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice for booking #" + bookingId + " not found"));
        return new InvoiceDto(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceDto> getInvoicesForCustomer(Long customerId) {
        return invoiceRepository.findByCustomerIdOrderByIssuedAtDesc(customerId).stream()
                .map(InvoiceDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvoiceDto> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(InvoiceDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markInvoicePaid(Invoice invoice, Payment payment) {
        invoice.setPayment(payment);
        invoice.setStatus("PAID");
        invoice.setPaidAt(LocalDateTime.now());
        invoiceRepository.save(invoice);
    }
}
