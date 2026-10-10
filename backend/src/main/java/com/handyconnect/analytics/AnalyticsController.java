package com.handyconnect.analytics;

import com.handyconnect.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Analytics & Reports", description = "Business analytics, revenue reporting, and inventory KPIs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Get executive system overview metrics and dashboard analytics")
    public ResponseEntity<ApiResponse<AnalyticsDto>> getOverviewMetrics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOverviewMetrics()));
    }
}
