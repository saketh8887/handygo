package com.handyconnect.booking;

import com.handyconnect.common.exception.BadRequestException;
import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.common.exception.UnauthorizedException;
import com.handyconnect.customer.Address;
import com.handyconnect.customer.AddressRepository;
import com.handyconnect.handyman.HandymanProfile;
import com.handyconnect.handyman.HandymanProfileRepository;
import com.handyconnect.inventory.*;
import com.handyconnect.invoice.InvoiceService;
import com.handyconnect.logistics.HandymanRecommendation;
import com.handyconnect.logistics.JobReadinessEngine;
import com.handyconnect.logistics.JobReadinessEvaluation;
import com.handyconnect.logistics.MaterialReadinessItem;
import com.handyconnect.notification.NotificationService;
import com.handyconnect.security.SecurityUtils;
import com.handyconnect.servicecatalog.ServiceEntity;
import com.handyconnect.servicecatalog.ServiceEntityRepository;
import com.handyconnect.servicecatalog.ServiceMaterial;
import com.handyconnect.servicecatalog.ServiceMaterialRepository;
import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.springframework.context.annotation.Lazy;
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
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingAssignmentRepository assignmentRepository;
    private final BookingStatusHistoryRepository historyRepository;
    private final BookingMaterialRepository bookingMaterialRepository;
    private final BookingStateMachine stateMachine;
    private final ServiceEntityRepository serviceRepository;
    private final ServiceMaterialRepository serviceMaterialRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final HandymanProfileRepository handymanProfileRepository;
    private final InventoryService inventoryService;
    private final JobReadinessEngine readinessEngine;
    private final NotificationService notificationService;
    private final InvoiceService invoiceService;

    public BookingService(BookingRepository bookingRepository,
                          BookingAssignmentRepository assignmentRepository,
                          BookingStatusHistoryRepository historyRepository,
                          BookingMaterialRepository bookingMaterialRepository,
                          BookingStateMachine stateMachine,
                          ServiceEntityRepository serviceRepository,
                          ServiceMaterialRepository serviceMaterialRepository,
                          AddressRepository addressRepository,
                          UserRepository userRepository,
                          HandymanProfileRepository handymanProfileRepository,
                          InventoryService inventoryService,
                          JobReadinessEngine readinessEngine,
                          NotificationService notificationService,
                          @Lazy InvoiceService invoiceService) {
        this.bookingRepository = bookingRepository;
        this.assignmentRepository = assignmentRepository;
        this.historyRepository = historyRepository;
        this.bookingMaterialRepository = bookingMaterialRepository;
        this.stateMachine = stateMachine;
        this.serviceRepository = serviceRepository;
        this.serviceMaterialRepository = serviceMaterialRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.handymanProfileRepository = handymanProfileRepository;
        this.inventoryService = inventoryService;
        this.readinessEngine = readinessEngine;
        this.notificationService = notificationService;
        this.invoiceService = invoiceService;
    }

    @Transactional
    public BookingDto createBooking(BookingRequest req, Long customerUserId) {
        User customer = userRepository.findById(customerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerUserId));

        ServiceEntity service = serviceRepository.findById(req.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", req.getServiceId()));

        Address address = addressRepository.findById(req.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", req.getAddressId()));

        if (!address.getUser().getId().equals(customerUserId)) {
            throw new UnauthorizedException("Customer does not own this address");
        }

        // Calculate indicative quotation: base price + standard material prices
        BigDecimal basePrice = service.getIndicativeBasePrice();
        List<ServiceMaterial> materials = serviceMaterialRepository.findByServiceId(service.getId());
        BigDecimal estMaterialsPrice = BigDecimal.ZERO;
        for (ServiceMaterial sm : materials) {
            BigDecimal line = sm.getItem().getSellingPrice().multiply(sm.getStandardQuantity());
            estMaterialsPrice = estMaterialsPrice.add(line);
        }
        BigDecimal quotation = basePrice.add(estMaterialsPrice);

        // Generate unique reference BK-YYYYMMDD-XXXX
        String datePrefix = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String ref = "BK-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        Booking booking = new Booking();
        booking.setBookingReference(ref);
        booking.setCustomer(customer);
        booking.setService(service);
        booking.setAddress(address);
        booking.setStatus(BookingStatus.PENDING);
        booking.setScheduledDate(req.getScheduledDate());
        booking.setScheduledTimeSlot(req.getScheduledTimeSlot());
        booking.setProblemDescription(req.getProblemDescription());
        booking.setPhotoUrl(req.getPhotoUrl());
        booking.setQuotationAmount(quotation);
        booking.setMaterialsAmount(estMaterialsPrice);
        booking.setFinalAmount(quotation);

        // Initial readiness check
        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);
        booking.setJobReadinessStatus(eval.getReadinessStatus().name());
        booking.setReadinessNotes(eval.getSummary());

        Booking saved = bookingRepository.save(booking);

        // Log status history
        historyRepository.save(new BookingStatusHistory(saved, null, BookingStatus.PENDING.name(), customer, "Booking requested by customer"));

        notificationService.createNotification(customer, "Booking Received",
                "Your booking " + saved.getBookingReference() + " for " + service.getName() + " has been received.",
                "BOOKING", "BOOKING", saved.getId().toString());

        return mapToDto(saved);
    }

    @Transactional
    public BookingDto assignHandyman(Long bookingId, Long handymanId, Long adminUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        User admin = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;
        HandymanProfile handyman = handymanProfileRepository.findById(handymanId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "id", handymanId));

        stateMachine.validateTransition(booking.getStatus(), BookingStatus.ASSIGNED);

        // Evaluate match
        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);
        HandymanRecommendation match = eval.getEligibleHandymen().stream()
                .filter(h -> h.getHandymanId().equals(handymanId))
                .findFirst()
                .orElse(null);

        BigDecimal score = match != null ? match.getMatchScore() : BigDecimal.valueOf(50.0);
        String reason = match != null && match.getMatchReasons() != null ?
                String.join("; ", match.getMatchReasons()) : "Direct admin assignment";

        BookingAssignment assignment = new BookingAssignment(booking, handyman, admin, score, reason);
        assignmentRepository.save(assignment);

        // Reserve materials automatically from recommended warehouses
        for (MaterialReadinessItem item : eval.getMaterialReadiness()) {
            if ("LOCAL_RESERVE".equals(item.getFulfillmentStrategy()) && item.getRecommendedLocationId() != null) {
                try {
                    MaterialReservation res = inventoryService.reserveMaterial(
                            booking.getId(), item.getItemId(), item.getRecommendedLocationId(), item.getRequiredQuantity()
                    );
                    BookingMaterial bm = new BookingMaterial(booking, res.getItem(), res.getLocation(), item.getRequiredQuantity(), res.getItem().getSellingPrice());
                    bookingMaterialRepository.save(bm);
                } catch (Exception e) {
                    booking.setJobReadinessStatus("AT_RISK");
                    booking.setReadinessNotes("Could not reserve " + item.getName() + ": " + e.getMessage());
                }
            }
        }

        // Transition booking status
        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.ASSIGNED);
        bookingRepository.save(booking);

        historyRepository.save(new BookingStatusHistory(booking, oldStatus.name(), BookingStatus.ASSIGNED.name(), admin,
                "Assigned to handyman " + handyman.getUser().getFullName() + " (Score: " + score + "%)"));

        // Notify handyman and customer
        notificationService.createNotification(handyman.getUser(), "New Job Assignment",
                "You have been assigned to job " + booking.getBookingReference() + " (" + booking.getService().getName() + "). Please review and accept.",
                "ASSIGNMENT", "BOOKING", booking.getId().toString());

        notificationService.createNotification(booking.getCustomer(), "Handyman Assigned",
                "Handyman " + handyman.getUser().getFullName() + " has been assigned to your booking " + booking.getBookingReference() + ".",
                "ASSIGNMENT", "BOOKING", booking.getId().toString());

        return mapToDto(booking);
    }

    @Transactional
    public BookingDto respondToAssignment(Long bookingId, Long handymanUserId, boolean accept, String rejectionReason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        HandymanProfile profile = handymanProfileRepository.findByUserId(handymanUserId)
                .orElseThrow(() -> new UnauthorizedException("Current user is not a registered handyman"));

        BookingAssignment assignment = assignmentRepository.findByBookingIdAndHandymanId(booking.getId(), profile.getId())
                .orElseThrow(() -> new UnauthorizedException("Assignment does not belong to current handyman"));

        assignment.setRespondedAt(LocalDateTime.now());

        if (accept) {
            stateMachine.validateTransition(booking.getStatus(), BookingStatus.ACCEPTED);
            assignment.setAssignmentStatus("ACCEPTED");
            assignmentRepository.save(assignment);

            BookingStatus oldStatus = booking.getStatus();
            booking.setStatus(BookingStatus.ACCEPTED);
            bookingRepository.save(booking);

            historyRepository.save(new BookingStatusHistory(booking, oldStatus.name(), BookingStatus.ACCEPTED.name(), profile.getUser(), "Handyman accepted assignment"));

            notificationService.createNotification(booking.getCustomer(), "Handyman Confirmed",
                    profile.getUser().getFullName() + " accepted your booking and confirmed appointment on " + booking.getScheduledDate(),
                    "BOOKING", "BOOKING", booking.getId().toString());
        } else {
            assignment.setAssignmentStatus("REJECTED");
            assignment.setRejectionReason(rejectionReason);
            assignmentRepository.save(assignment);

            BookingStatus oldStatus = booking.getStatus();
            booking.setStatus(BookingStatus.REJECTED);
            bookingRepository.save(booking);

            historyRepository.save(new BookingStatusHistory(booking, oldStatus.name(), BookingStatus.REJECTED.name(), profile.getUser(),
                    "Handyman declined assignment: " + rejectionReason));
        }

        return mapToDto(booking);
    }

    @Transactional
    public BookingDto updateStatus(Long bookingId, BookingStatus newStatus, String notes, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        stateMachine.validateTransition(booking.getStatus(), newStatus);

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(newStatus);

        // If entering IN_PROGRESS, issue reserved materials to handyman
        if (newStatus == BookingStatus.IN_PROGRESS) {
            List<BookingMaterial> bms = bookingMaterialRepository.findByBookingId(booking.getId());
            for (BookingMaterial bm : bms) {
                if ("RESERVED".equals(bm.getStatus())) {
                    inventoryService.issueMaterial(booking.getId(), bm.getItem().getId(), bm.getLocation().getId(), bm.getReservedQty(), userId);
                    bm.setStatus("ISSUED");
                    bm.setUsedQty(bm.getReservedQty());
                    bookingMaterialRepository.save(bm);
                }
            }
        }

        bookingRepository.save(booking);
        historyRepository.save(new BookingStatusHistory(booking, oldStatus.name(), newStatus.name(), user, notes));

        notificationService.createNotification(booking.getCustomer(), "Job Status Update",
                "Your booking " + booking.getBookingReference() + " is now " + newStatus.name(),
                "BOOKING", "BOOKING", booking.getId().toString());

        return mapToDto(booking);
    }

    @Transactional
    public BookingDto recordMaterialsAndComplete(Long bookingId, BigDecimal usedAmount, String completionNotes, String completionPhotoUrl, Long handymanUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        User user = handymanUserId != null ? userRepository.findById(handymanUserId).orElse(null) : null;

        stateMachine.validateTransition(booking.getStatus(), BookingStatus.COMPLETED);

        // Record consumption on any booking materials
        List<BookingMaterial> materials = bookingMaterialRepository.findByBookingId(booking.getId());
        BigDecimal totalMaterialsCost = BigDecimal.ZERO;
        for (BookingMaterial bm : materials) {
            bm.setStatus("CONSUMED");
            totalMaterialsCost = totalMaterialsCost.add(bm.getUnitPrice().multiply(bm.getUsedQty()));
            bookingMaterialRepository.save(bm);

            inventoryService.recordConsumption(booking.getId(), bm.getItem().getId(), bm.getLocation().getId(), bm.getUsedQty(), bm.getReturnedQty(), handymanUserId);
        }

        if (totalMaterialsCost.compareTo(BigDecimal.ZERO) == 0 && usedAmount != null) {
            totalMaterialsCost = usedAmount;
        }

        // Calculate final amount = base price + actual materials
        BigDecimal base = booking.getService().getIndicativeBasePrice();
        BigDecimal finalTotal = base.add(totalMaterialsCost);

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setMaterialsAmount(totalMaterialsCost);
        booking.setFinalAmount(finalTotal);
        booking.setCompletionNotes(completionNotes);
        booking.setCompletionPhotoUrl(completionPhotoUrl);

        Booking saved = bookingRepository.save(booking);

        historyRepository.save(new BookingStatusHistory(saved, oldStatus.name(), BookingStatus.COMPLETED.name(), user,
                "Service completed by technician. Final bill calculated: $" + finalTotal));

        // Generate invoice automatically
        invoiceService.createInvoiceForBooking(saved);

        notificationService.createNotification(saved.getCustomer(), "Service Completed",
                "Your service for " + saved.getService().getName() + " has completed! Total payable: $" + finalTotal,
                "BOOKING", "BOOKING", saved.getId().toString());

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getBookingsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if ("ROLE_CUSTOMER".equals(user.getRole())) {
            return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(userId).stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        } else if ("ROLE_HANDYMAN".equals(user.getRole())) {
            HandymanProfile profile = handymanProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile not found"));
            List<BookingAssignment> assignments = assignmentRepository.findByHandymanIdOrderByAssignedAtDesc(profile.getId());
            return assignments.stream()
                    .map(a -> mapToDto(a.getBooking()))
                    .collect(Collectors.toList());
        } else {
            // ADMIN or INVENTORY MANAGER: all bookings
            return bookingRepository.findAll().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return mapToDto(booking);
    }

    @Transactional(readOnly = true)
    public JobReadinessEvaluation evaluateBookingReadiness(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return readinessEngine.evaluateBooking(booking);
    }

    public BookingDto mapToDto(Booking b) {
        BookingDto dto = new BookingDto();
        dto.setId(b.getId());
        dto.setBookingReference(b.getBookingReference());
        if (b.getCustomer() != null) {
            dto.setCustomerId(b.getCustomer().getId());
            dto.setCustomerName(b.getCustomer().getFullName());
            dto.setCustomerPhone(b.getCustomer().getPhone());
        }
        if (b.getService() != null) {
            dto.setServiceId(b.getService().getId());
            dto.setServiceName(b.getService().getName());
            if (b.getService().getCategory() != null) {
                dto.setServiceCategory(b.getService().getCategory().getName());
            }
        }
        if (b.getAddress() != null) {
            dto.setAddressId(b.getAddress().getId());
            dto.setAddressLine(b.getAddress().getStreetLine());
            dto.setAddressCity(b.getAddress().getCity());
        }
        dto.setStatus(b.getStatus());
        dto.setScheduledDate(b.getScheduledDate());
        dto.setScheduledTimeSlot(b.getScheduledTimeSlot());
        dto.setProblemDescription(b.getProblemDescription());
        dto.setPhotoUrl(b.getPhotoUrl());
        dto.setQuotationAmount(b.getQuotationAmount());
        dto.setMaterialsAmount(b.getMaterialsAmount());
        dto.setFinalAmount(b.getFinalAmount());
        dto.setJobReadinessStatus(b.getJobReadinessStatus());
        dto.setReadinessNotes(b.getReadinessNotes());
        dto.setCancellationReason(b.getCancellationReason());
        dto.setCompletionNotes(b.getCompletionNotes());
        dto.setCompletionPhotoUrl(b.getCompletionPhotoUrl());
        dto.setCreatedAt(b.getCreatedAt());

        // Find assigned handyman
        assignmentRepository.findFirstByBookingIdOrderByAssignedAtDesc(b.getId()).ifPresent(a -> {
            dto.setAssignedHandymanId(a.getHandyman().getId());
            if (a.getHandyman().getUser() != null) {
                dto.setAssignedHandymanName(a.getHandyman().getUser().getFullName());
                dto.setAssignedHandymanPhone(a.getHandyman().getUser().getPhone());
            }
            dto.setAssignmentStatus(a.getAssignmentStatus());
        });

        // Materials
        List<BookingDto.BookingMaterialDto> materials = bookingMaterialRepository.findByBookingId(b.getId()).stream()
                .map(BookingDto.BookingMaterialDto::new)
                .collect(Collectors.toList());
        dto.setMaterials(materials);

        // History
        List<BookingDto.BookingStatusHistoryDto> history = historyRepository.findByBookingIdOrderByTimestampAsc(b.getId()).stream()
                .map(BookingDto.BookingStatusHistoryDto::new)
                .collect(Collectors.toList());
        dto.setHistory(history);

        return dto;
    }
}
