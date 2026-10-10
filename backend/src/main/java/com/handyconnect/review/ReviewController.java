package com.handyconnect.review;

import com.handyconnect.common.dto.ApiResponse;
import com.handyconnect.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@Tag(name = "Reviews", description = "Customer reviews and handyman ratings APIs")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @Operation(summary = "Submit a customer rating and review for completed booking")
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(@RequestBody Map<String, Object> body) {
        Long bookingId = Long.valueOf(body.get("bookingId").toString());
        Integer rating = Integer.valueOf(body.get("rating").toString());
        String comment = body.getOrDefault("comment", "").toString();
        Long customerId = SecurityUtils.getCurrentUserId();

        return ResponseEntity.ok(ApiResponse.success("Review submitted", reviewService.createReview(bookingId, rating, comment, customerId)));
    }

    @GetMapping("/handyman/{handymanId}")
    @Operation(summary = "Get reviews for a handyman")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getHandymanReviews(@PathVariable Long handymanId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewsForHandyman(handymanId)));
    }

    @GetMapping
    @Operation(summary = "Get all reviews (Admin)")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getAllReviews()));
    }
}
