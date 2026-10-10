package com.handyconnect.analytics;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AnalyticsDto {
    private long totalBookings;
    private long pendingBookings;
    private long inProgressBookings;
    private long completedBookings;
    private long cancelledBookings;
    private BigDecimal totalRevenue;
    private double averageRating;
    private long totalHandymen;
    private long verifiedHandymen;
    private double handymanUtilizationRate; // percentage
    private long lowStockItemCount;
    private BigDecimal inventoryValuation;
    private long pendingPurchaseOrders;
    private long jobsBlockedCount;
    private long jobsAtRiskCount;
    private List<CategoryConsumptionDto> consumptionByCategory;
    private List<MonthlyRevenueDto> monthlyRevenue;

    public AnalyticsDto() {}

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

    public long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(long pendingBookings) { this.pendingBookings = pendingBookings; }

    public long getInProgressBookings() { return inProgressBookings; }
    public void setInProgressBookings(long inProgressBookings) { this.inProgressBookings = inProgressBookings; }

    public long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(long completedBookings) { this.completedBookings = completedBookings; }

    public long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(long cancelledBookings) { this.cancelledBookings = cancelledBookings; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public long getTotalHandymen() { return totalHandymen; }
    public void setTotalHandymen(long totalHandymen) { this.totalHandymen = totalHandymen; }

    public long getVerifiedHandymen() { return verifiedHandymen; }
    public void setVerifiedHandymen(long verifiedHandymen) { this.verifiedHandymen = verifiedHandymen; }

    public double getHandymanUtilizationRate() { return handymanUtilizationRate; }
    public void setHandymanUtilizationRate(double handymanUtilizationRate) { this.handymanUtilizationRate = handymanUtilizationRate; }

    public long getLowStockItemCount() { return lowStockItemCount; }
    public void setLowStockItemCount(long lowStockItemCount) { this.lowStockItemCount = lowStockItemCount; }

    public BigDecimal getInventoryValuation() { return inventoryValuation; }
    public void setInventoryValuation(BigDecimal inventoryValuation) { this.inventoryValuation = inventoryValuation; }

    public long getPendingPurchaseOrders() { return pendingPurchaseOrders; }
    public void setPendingPurchaseOrders(long pendingPurchaseOrders) { this.pendingPurchaseOrders = pendingPurchaseOrders; }

    public long getJobsBlockedCount() { return jobsBlockedCount; }
    public void setJobsBlockedCount(long jobsBlockedCount) { this.jobsBlockedCount = jobsBlockedCount; }

    public long getJobsAtRiskCount() { return jobsAtRiskCount; }
    public void setJobsAtRiskCount(long jobsAtRiskCount) { this.jobsAtRiskCount = jobsAtRiskCount; }

    public List<CategoryConsumptionDto> getConsumptionByCategory() { return consumptionByCategory; }
    public void setConsumptionByCategory(List<CategoryConsumptionDto> consumptionByCategory) { this.consumptionByCategory = consumptionByCategory; }

    public List<MonthlyRevenueDto> getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(List<MonthlyRevenueDto> monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }

    public static class CategoryConsumptionDto {
        private String categoryName;
        private long jobCount;
        private BigDecimal materialsValue;

        public CategoryConsumptionDto(String categoryName, long jobCount, BigDecimal materialsValue) {
            this.categoryName = categoryName;
            this.jobCount = jobCount;
            this.materialsValue = materialsValue;
        }

        public String getCategoryName() { return categoryName; }
        public long getJobCount() { return jobCount; }
        public BigDecimal getMaterialsValue() { return materialsValue; }
    }

    public static class MonthlyRevenueDto {
        private String month;
        private BigDecimal revenue;
        private long bookings;

        public MonthlyRevenueDto(String month, BigDecimal revenue, long bookings) {
            this.month = month;
            this.revenue = revenue;
            this.bookings = bookings;
        }

        public String getMonth() { return month; }
        public BigDecimal getRevenue() { return revenue; }
        public long getBookings() { return bookings; }
    }
}
