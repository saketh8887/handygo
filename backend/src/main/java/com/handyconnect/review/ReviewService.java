package com.handyconnect.review;

import com.handyconnect.booking.Booking;
import com.handyconnect.booking.BookingAssignment;
import com.handyconnect.booking.BookingAssignmentRepository;
import com.handyconnect.booking.BookingRepository;
import com.handyconnect.common.exception.BadRequestException;
import com.handyconnect.common.exception.ResourceNotFoundException;
import com.handyconnect.handyman.HandymanProfile;
import com.handyconnect.handyman.HandymanProfileRepository;
import com.handyconnect.notification.NotificationService;
import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final BookingAssignmentRepository assignmentRepository;
    private final HandymanProfileRepository handymanProfileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository,
                         BookingAssignmentRepository assignmentRepository,
                         HandymanProfileRepository handymanProfileRepository,
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.assignmentRepository = assignmentRepository;
        this.handymanProfileRepository = handymanProfileRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ReviewDto createReview(Long bookingId, Integer rating, String comment, Long customerUserId) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars");
        }

        if (reviewRepository.findByBookingId(bookingId).isPresent()) {
            throw new BadRequestException("This booking has already been reviewed");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getCustomer().getId().equals(customerUserId)) {
            throw new BadRequestException("Customer can only review their own bookings");
        }

        User customer = userRepository.findById(customerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerUserId));

        BookingAssignment assignment = assignmentRepository.findFirstByBookingIdOrderByAssignedAtDesc(bookingId)
                .orElseThrow(() -> new BadRequestException("No handyman assignment found for this booking"));

        HandymanProfile handyman = assignment.getHandyman();

        Review review = new Review();
        review.setBooking(booking);
        review.setCustomer(customer);
        review.setHandyman(handyman);
        review.setRating(rating);
        review.setComment(comment);

        Review saved = reviewRepository.save(review);

        // Recalculate handyman's average rating
        List<Review> handymanReviews = reviewRepository.findByHandymanIdOrderByCreatedAtDesc(handyman.getId());
        double avg = handymanReviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
        handyman.setRatingAvg(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        handyman.setRatingCount(handymanReviews.size());
        handymanProfileRepository.save(handyman);

        notificationService.createNotification(handyman.getUser(), "New Customer Review",
                "Customer " + customer.getFullName() + " left a " + rating + "-star review for " + booking.getBookingReference(),
                "REVIEW", "BOOKING", bookingId.toString());

        return new ReviewDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviewsForHandyman(Long handymanId) {
        return reviewRepository.findByHandymanIdOrderByCreatedAtDesc(handymanId).stream()
                .map(ReviewDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(ReviewDto::new)
                .collect(Collectors.toList());
    }
}
