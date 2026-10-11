package com.handyconnect.booking;

import com.handyconnect.common.exception.BadRequestException;
import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.common.exception.UnauthorizedException;
import com.handyconnect.customer.Address;
import com.handyconnect.customer.AddressRepository;
import com.handyconnect.handyman.HandymanProfile;
import com.handyconnect.handyman.HandymanProfileRepository;
import com.handyconnect.handyman.HandymanSpecialization;
import com.handyconnect.servicecatalog.ServiceRequiredSkill;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.access.AccessDeniedException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
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
    private final AttachmentService attachmentService;
    private final com.handyconnect.servicecatalog.ServiceRequiredSkillRepository serviceRequiredSkillRepository;
    private final com.handyconnect.handyman.HandymanSpecializationRepository handymanSpecializationRepository;
    private final com.handyconnect.team.HandymanTeamRepository handymanTeamRepository;

    @Value("${handyconnect.dispatch.auto-assign-enabled:false}")
    private boolean autoAssignEnabled;

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
                          @Lazy InvoiceService invoiceService,
                          AttachmentService attachmentService,
                          com.handyconnect.servicecatalog.ServiceRequiredSkillRepository serviceRequiredSkillRepository,
                          com.handyconnect.handyman.HandymanSpecializationRepository handymanSpecializationRepository,
                          com.handyconnect.team.HandymanTeamRepository handymanTeamRepository) {
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
        this.attachmentService = attachmentService;
        this.serviceRequiredSkillRepository = serviceRequiredSkillRepository;
        this.handymanSpecializationRepository = handymanSpecializationRepository;
        this.handymanTeamRepository = handymanTeamRepository;
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

        // Link problem photo attachments if uploaded
        if (req.getAttachmentIds() != null && !req.getAttachmentIds().isEmpty()) {
            attachmentService.linkAttachmentsToBooking(req.getAttachmentIds(), saved, customerUserId);
        }

        // Log status history
        historyRepository.save(new BookingStatusHistory(saved, null, BookingStatus.PENDING.name(), customer, "Booking requested by customer"));

        notificationService.createNotification(customer, "Booking Received",
                "Your booking " + saved.getBookingReference() + " for " + service.getName() + " has been received.",
                "BOOKING", "BOOKING", saved.getId().toString());

        // Technician selection: direct selection or automatic intelligent dispatch
        if (req.getSelectedHandymanId() != null) {
            HandymanProfile selected = handymanProfileRepository.findById(req.getSelectedHandymanId())
                    .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "id", req.getSelectedHandymanId()));

            if ("INACTIVE".equalsIgnoreCase(selected.getActiveStatus())) {
                throw new BadRequestException("Technician " + selected.getUser().getFullName() + " is currently inactive and cannot accept new bookings");
            }

            // Conflict check
            List<BookingAssignment> conflicts = assignmentRepository.findConflictingAssignments(
                    selected.getId(), req.getScheduledDate(), req.getScheduledTimeSlot());
            if (!conflicts.isEmpty()) {
                throw new BadRequestException("Technician " + selected.getUser().getFullName() +
                        " is already booked for " + req.getScheduledDate() + " during slot " + req.getScheduledTimeSlot() +
                        ". Please choose another time slot or use auto-dispatch.");
            }

            return assignHandyman(saved.getId(), selected.getId(), null, false, "Customer selected specialist");
        } else {
            // "⚡ Automatically Assign the Best Available Professional"
            HandymanRecommendation topMatch = eval.getEligibleHandymen().stream()
                    .filter(HandymanRecommendation::isEligible)
                    .findFirst()
                    .orElse(null);
            if (topMatch != null) {
                return assignHandyman(saved.getId(), topMatch.getHandymanId(), null);
            } else {
                String reasonSummary = eval.getEligibleHandymen().stream()
                        .filter(h -> h.getIneligibilityReasons() != null && !h.getIneligibilityReasons().isEmpty())
                        .map(h -> h.getFullName() + ": " + String.join(", ", h.getIneligibilityReasons()))
                        .reduce((a, b) -> a + "; " + b)
                        .orElse("No available technicians meet mandatory trade skill, schedule, or workload capacity requirements");
                saved.setReadinessNotes("Awaiting dispatch review — " + reasonSummary);
                bookingRepository.save(saved);
            }
        }

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<HandymanRecommendation> getAssignmentRecommendations(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);
        return eval.getEligibleHandymen();
    }

    @Transactional
    public BookingDto assignHandyman(Long bookingId, Long handymanId, Long adminUserId) {
        return assignHandyman(bookingId, handymanId, adminUserId, false, null);
    }

    @Transactional
    public BookingDto assignHandyman(Long bookingId, Long handymanId, Long adminUserId, boolean overrideRules, String overrideReason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        User admin = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;
        HandymanProfile handyman = handymanProfileRepository.findById(handymanId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "id", handymanId));

        if (booking.getStatus() == BookingStatus.PENDING) {
            stateMachine.validateTransition(booking.getStatus(), BookingStatus.ASSIGNED);
        }

        // Evaluate skill-based match and eligibility
        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);
        HandymanRecommendation match = eval.getEligibleHandymen().stream()
                .filter(h -> h.getHandymanId().equals(handymanId))
                .findFirst()
                .orElse(null);

        BigDecimal score = BigDecimal.valueOf(50.0);
        String reason = "Intelligent skill-based match";

        if (match == null || !match.isEligible()) {
            String constraintReason = match != null && match.getIneligibilityReasons() != null && !match.getIneligibilityReasons().isEmpty()
                    ? String.join("; ", match.getIneligibilityReasons())
                    : "Technician does not meet mandatory department, skills or eligibility requirements for this service";
            if (!overrideRules || adminUserId == null) {
                throw new BadRequestException("Technician " + handyman.getUser().getFullName() + " cannot be assigned: " + constraintReason);
            }
            score = BigDecimal.valueOf(40.0);
            reason = "Admin manual dispatch override" + (overrideReason != null && !overrideReason.isBlank() ? ": " + overrideReason : "")
                    + " (Overridden constraints: " + constraintReason + ")";
        } else {
            score = match.getMatchScore() != null ? match.getMatchScore() : BigDecimal.valueOf(50.0);
            reason = match.getMatchReasons() != null && !match.getMatchReasons().isEmpty() ?
                    String.join("; ", match.getMatchReasons()) : "Intelligent department & skill match";
        }

        // Mark any previous assignments as REASSIGNED to preserve audit history
        List<BookingAssignment> priorAssignments = assignmentRepository.findByBookingId(booking.getId());
        for (BookingAssignment prior : priorAssignments) {
            if ("PENDING".equals(prior.getAssignmentStatus()) || "ACCEPTED".equals(prior.getAssignmentStatus())) {
                prior.setAssignmentStatus("REASSIGNED");
                assignmentRepository.save(prior);
            }
        }

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
                "Assigned to handyman " + handyman.getUser().getFullName() + " (" + match.getPrimarySpecialization() + ", Match Score: " + score + "%)"));

        // Notify handyman and customer
        notificationService.createNotification(handyman.getUser(), "New Job Assignment",
                "You have been assigned to job " + booking.getBookingReference() + " (" + booking.getService().getName() + "). Please review and accept.",
                "ASSIGNMENT", "BOOKING", booking.getId().toString());

        notificationService.createNotification(booking.getCustomer(), "Handyman Assigned",
                "Handyman " + handyman.getUser().getFullName() + " (" + match.getPrimarySpecialization() + ") has been assigned to your booking " + booking.getBookingReference() + ".",
                "ASSIGNMENT", "BOOKING", booking.getId().toString());

        return mapToDto(booking);
    }

    @Transactional
    public BookingDto reassignHandyman(Long bookingId, Long newHandymanId, Long adminUserId, String reasonNote) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        User admin = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;
        HandymanProfile newHandyman = handymanProfileRepository.findById(newHandymanId)
                .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile", "id", newHandymanId));

        // Evaluate skill-based match and eligibility
        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);
        HandymanRecommendation match = eval.getEligibleHandymen().stream()
                .filter(h -> h.getHandymanId().equals(newHandymanId))
                .findFirst()
                .orElse(null);

        if (match == null || !match.isEligible()) {
            String failureReason = match != null && match.getIneligibilityReasons() != null && !match.getIneligibilityReasons().isEmpty()
                    ? String.join("; ", match.getIneligibilityReasons())
                    : "Technician does not meet mandatory skills or eligibility requirements for this service";
            throw new BadRequestException("Technician " + newHandyman.getUser().getFullName() + " cannot be assigned: " + failureReason);
        }

        BigDecimal score = match.getMatchScore() != null ? match.getMatchScore() : BigDecimal.valueOf(50.0);
        String matchReason = match.getMatchReasons() != null && !match.getMatchReasons().isEmpty() ?
                String.join("; ", match.getMatchReasons()) : "Reassignment selection";

        // Mark prior assignments as REASSIGNED
        List<BookingAssignment> priorAssignments = assignmentRepository.findByBookingId(booking.getId());
        HandymanProfile oldHandyman = null;
        for (BookingAssignment prior : priorAssignments) {
            if ("PENDING".equals(prior.getAssignmentStatus()) || "ACCEPTED".equals(prior.getAssignmentStatus())) {
                prior.setAssignmentStatus("REASSIGNED");
                assignmentRepository.save(prior);
                oldHandyman = prior.getHandyman();
            }
        }

        BookingAssignment newAssignment = new BookingAssignment(booking, newHandyman, admin, score, matchReason);
        assignmentRepository.save(newAssignment);

        booking.setStatus(BookingStatus.ASSIGNED);
        bookingRepository.save(booking);

        String note = "Reassigned to " + newHandyman.getUser().getFullName() +
                (reasonNote != null && !reasonNote.isBlank() ? " (Reason: " + reasonNote + ")" : "") +
                " [Match Score: " + score + "%]";
        historyRepository.save(new BookingStatusHistory(booking, BookingStatus.ASSIGNED.name(), BookingStatus.ASSIGNED.name(), admin, note));

        if (oldHandyman != null && oldHandyman.getUser() != null) {
            notificationService.createNotification(oldHandyman.getUser(), "Job Reassigned",
                    "Booking " + booking.getBookingReference() + " has been reassigned to another technician.",
                    "ASSIGNMENT", "BOOKING", booking.getId().toString());
        }

        notificationService.createNotification(newHandyman.getUser(), "New Job Assignment (Reassigned)",
                "You have been assigned to job " + booking.getBookingReference() + " (" + booking.getService().getName() + "). Please review and accept.",
                "ASSIGNMENT", "BOOKING", booking.getId().toString());

        notificationService.createNotification(booking.getCustomer(), "Handyman Reassigned",
                "Your booking " + booking.getBookingReference() + " has been reassigned to " + newHandyman.getUser().getFullName() + " (" + match.getPrimarySpecialization() + ").",
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
        } else if (newStatus == BookingStatus.CANCELLED) {
            inventoryService.releaseReservationsForBooking(booking.getId(), userId);
            List<BookingMaterial> bms = bookingMaterialRepository.findByBookingId(booking.getId());
            for (BookingMaterial bm : bms) {
                if ("RESERVED".equals(bm.getStatus())) {
                    bm.setStatus("CANCELLED");
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
        return getBookingsForUser(userId, null, null, null, null, null);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getBookingsForUser(Long userId, Long categoryId, Long handymanId, BookingStatus status, LocalDate fromDate, LocalDate toDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<Booking> list;
        if ("ROLE_CUSTOMER".equals(user.getRole())) {
            list = bookingRepository.findByCustomerIdOrderByCreatedAtDesc(userId);
        } else if ("ROLE_HANDYMAN".equals(user.getRole())) {
            HandymanProfile profile = handymanProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("HandymanProfile not found"));
            List<BookingAssignment> assignments = assignmentRepository.findByHandymanIdOrderByAssignedAtDesc(profile.getId());
            list = assignments.stream().map(BookingAssignment::getBooking).collect(Collectors.toList());
        } else {
            // ADMIN or INVENTORY MANAGER: all bookings
            list = bookingRepository.findAll();
        }

        return list.stream()
                .filter(b -> categoryId == null || (b.getService() != null && b.getService().getCategory() != null && b.getService().getCategory().getId().equals(categoryId)))
                .filter(b -> status == null || b.getStatus() == status)
                .filter(b -> fromDate == null || (b.getScheduledDate() != null && !b.getScheduledDate().isBefore(fromDate)))
                .filter(b -> toDate == null || (b.getScheduledDate() != null && !b.getScheduledDate().isAfter(toDate)))
                .filter(b -> {
                    if (handymanId == null) return true;
                    return assignmentRepository.findByBookingId(b.getId()).stream()
                            .anyMatch(a -> a.getHandyman() != null && a.getHandyman().getId().equals(handymanId) && !"REASSIGNED".equals(a.getAssignmentStatus()));
                })
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingById(Long id) {
        return getBookingById(id, null);
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingById(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        validateBookingAccess(booking, userId);
        return mapToDto(booking);
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingByIdOrReference(String idOrRef, Long userId) {
        Booking booking = findBookingByIdOrReference(idOrRef);
        validateBookingAccess(booking, userId);
        return mapToDto(booking);
    }

    @Transactional(readOnly = true)
    public JobReadinessEvaluation evaluateBookingReadiness(Long id) {
        return evaluateBookingReadiness(id, null);
    }

    @Transactional(readOnly = true)
    public JobReadinessEvaluation evaluateBookingReadiness(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        validateBookingAccess(booking, userId);
        return readinessEngine.evaluateBooking(booking);
    }

    @Transactional(readOnly = true)
    public JobReadinessEvaluation evaluateBookingReadinessByIdOrRef(String idOrRef, Long userId) {
        Booking booking = findBookingByIdOrReference(idOrRef);
        validateBookingAccess(booking, userId);
        return readinessEngine.evaluateBooking(booking);
    }

    private Booking findBookingByIdOrReference(String idOrRef) {
        if (idOrRef == null || idOrRef.isBlank()) {
            throw new ResourceNotFoundException("Booking", "id", idOrRef);
        }
        try {
            Long numericId = Long.parseLong(idOrRef);
            Optional<Booking> byId = bookingRepository.findById(numericId);
            if (byId.isPresent()) return byId.get();
        } catch (NumberFormatException ignored) {}

        return bookingRepository.findByBookingReference(idOrRef)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "reference", idOrRef));
    }

    public void validateBookingAccess(Booking booking, Long userId) {
        if (userId == null) return;
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        // Admin and Inventory Manager can view any booking
        if ("ROLE_ADMIN".equals(user.getRole()) || "ROLE_INVENTORY_MANAGER".equals(user.getRole())) {
            return;
        }

        // Customer can only view their own bookings
        if ("ROLE_CUSTOMER".equals(user.getRole())) {
            if (booking.getCustomer() == null || !booking.getCustomer().getId().equals(userId)) {
                throw new AccessDeniedException("You are not authorized to view this booking.");
            }
            return;
        }

        // Handyman can only view bookings assigned to them
        if ("ROLE_HANDYMAN".equals(user.getRole())) {
            HandymanProfile profile = handymanProfileRepository.findByUserId(userId).orElse(null);
            if (profile == null) {
                throw new AccessDeniedException("Technician profile not found.");
            }
            List<BookingAssignment> assignments = assignmentRepository.findByBookingId(booking.getId());
            boolean isAssigned = assignments.stream().anyMatch(a -> a.getHandyman().getId().equals(profile.getId()));
            if (!isAssigned) {
                throw new AccessDeniedException("You are not authorized to view this booking as you are not the assigned technician.");
            }
            return;
        }
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
                dto.setCategoryId(b.getService().getCategory().getId());
                dto.setServiceCategory(b.getService().getCategory().getName());
            }
            if (b.getService().getTeam() != null) {
                dto.setServiceTeamId(b.getService().getTeam().getId());
                dto.setServiceTeamName(b.getService().getTeam().getName());
                dto.setServiceTeamCode(b.getService().getTeam().getCode());
                dto.setServiceTeamIcon(b.getService().getTeam().getIconName());
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
            dto.setAssignedHandymanRating(a.getHandyman().getRatingAvg());
            dto.setAssignedHandymanPhoto(a.getHandyman().getProfilePhotoUrl());

            List<HandymanSpecialization> hSpecs = handymanSpecializationRepository.findByHandymanId(a.getHandyman().getId());
            List<String> specNames = hSpecs.stream().map(s -> s.getSpecialization().getName()).collect(Collectors.toList());
            dto.setAssignedHandymanSpecializations(specNames);
            hSpecs.stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsPrimary()))
                    .findFirst()
                    .ifPresent(s -> dto.setAssignedHandymanSpecialization(s.getSpecialization().getName()));
            if (dto.getAssignedHandymanSpecialization() == null && !specNames.isEmpty()) {
                dto.setAssignedHandymanSpecialization(specNames.get(0));
            }

            // Populate approved teams for assigned technician
            List<com.handyconnect.team.HandymanTeam> hTeams = handymanTeamRepository.findByHandymanId(a.getHandyman().getId());
            List<String> approvedTeams = hTeams.stream()
                    .filter(t -> "APPROVED".equalsIgnoreCase(t.getApprovalStatus()))
                    .map(t -> t.getTeam().getName())
                    .collect(Collectors.toList());
            dto.setAssignedHandymanTeams(approvedTeams);
            hTeams.stream()
                    .filter(t -> Boolean.TRUE.equals(t.getIsPrimary()) && "APPROVED".equalsIgnoreCase(t.getApprovalStatus()))
                    .findFirst()
                    .ifPresent(t -> dto.setAssignedHandymanPrimaryTeam(t.getTeam().getName()));
            if (dto.getAssignedHandymanPrimaryTeam() == null && !approvedTeams.isEmpty()) {
                dto.setAssignedHandymanPrimaryTeam(approvedTeams.get(0));
            }
        });

        // Required skills
        if (b.getService() != null) {
            List<ServiceRequiredSkill> reqSkills = serviceRequiredSkillRepository.findByServiceId(b.getService().getId());
            dto.setRequiredSkills(reqSkills.stream().map(s -> s.getSkill().getName()).collect(Collectors.toList()));
        }

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

        // Attached problem photos
        if (b.getAttachments() != null && !b.getAttachments().isEmpty()) {
            dto.setAttachments(b.getAttachments().stream().map(AttachmentDto::new).collect(Collectors.toList()));
            if (dto.getPhotoUrl() == null || dto.getPhotoUrl().isBlank()) {
                dto.setPhotoUrl(dto.getAttachments().get(0).getUrl());
            }
        }

        return dto;
    }
}
