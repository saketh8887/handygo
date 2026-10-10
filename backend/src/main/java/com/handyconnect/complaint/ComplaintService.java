package com.handyconnect.complaint;

import com.handyconnect.booking.Booking;
import com.handyconnect.booking.BookingRepository;
import com.handyconnect.common.exception.BadRequestException;
import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.notification.NotificationService;
import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            BookingRepository bookingRepository,
                            UserRepository userRepository,
                            NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ComplaintDto fileComplaint(Long bookingId, String category, String description, Long customerUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getCustomer().getId().equals(customerUserId)) {
            throw new BadRequestException("Customer can only file complaints on their own bookings");
        }

        User customer = userRepository.findById(customerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerUserId));

        String ref = "CMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Complaint complaint = new Complaint();
        complaint.setComplaintReference(ref);
        complaint.setBooking(booking);
        complaint.setCustomer(customer);
        complaint.setCategory(category);
        complaint.setDescription(description);
        complaint.setStatus("OPEN");

        Complaint saved = complaintRepository.save(complaint);

        notificationService.createNotification(customer, "Complaint Registered",
                "Your grievance " + ref + " has been registered and is under investigation by administration.",
                "COMPLAINT", "COMPLAINT", saved.getId().toString());

        return new ComplaintDto(saved);
    }

    @Transactional
    public ComplaintDto resolveComplaint(Long complaintId, String status, String resolutionNotes, Long adminUserId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", complaintId));

        User admin = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;

        complaint.setStatus(status.toUpperCase());
        complaint.setResolutionNotes(resolutionNotes);
        complaint.setResolvedBy(admin);
        complaint.setResolvedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        notificationService.createNotification(complaint.getCustomer(), "Complaint Status Updated",
                "Your complaint " + complaint.getComplaintReference() + " has been resolved. Note: " + resolutionNotes,
                "COMPLAINT", "COMPLAINT", saved.getId().toString());

        return new ComplaintDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto> getComplaintsForCustomer(Long customerId) {
        return complaintRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(ComplaintDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(ComplaintDto::new)
                .collect(Collectors.toList());
    }
}
