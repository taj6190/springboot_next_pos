package com.pos.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private BigDecimal todayRevenue;
    private BigDecimal weekRevenue;
    private BigDecimal monthRevenue;
    private BigDecimal totalRevenue;

    private long todayOrders;
    private long weekOrders;
    private long monthOrders;
    private long totalOrders;

    private long totalProducts;
    private long lowStockProducts;
    private long totalCustomers;

    private BigDecimal todayExpenses;
    private BigDecimal monthExpenses;
    private BigDecimal totalExpenses;
    private BigDecimal todayProfit;
    private BigDecimal monthProfit;

    private List<TopProductResponse> topProducts;
    private List<SalesChartData> salesChart;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductResponse {
        private Long productId;
        private String productName;
        private Long totalQuantity;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesChartData {
        private String date;
        private BigDecimal amount;
    }
}
