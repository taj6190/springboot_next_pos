package com.pos.backend.service;

import com.pos.backend.dto.response.DashboardResponse;
import com.pos.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final ExpenseRepository expenseRepository;

    public DashboardResponse getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime weekStart = LocalDate.now().minusDays(7).atStartOfDay();
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        return DashboardResponse.builder()
                .todayRevenue(orderRepository.sumRevenueBetween(todayStart, now))
                .weekRevenue(orderRepository.sumRevenueBetween(weekStart, now))
                .monthRevenue(orderRepository.sumRevenueBetween(monthStart, now))
                .totalRevenue(orderRepository.sumTotalRevenue())
                .todayOrders(orderRepository.countCompletedOrdersBetween(todayStart, now))
                .weekOrders(orderRepository.countCompletedOrdersBetween(weekStart, now))
                .monthOrders(orderRepository.countCompletedOrdersBetween(monthStart, now))
                .totalOrders(orderRepository.countCompleted())
                .totalProducts(productRepository.countActive())
                .lowStockProducts(productRepository.countLowStock())
                .totalCustomers(customerRepository.countByActiveTrue())
                .todayExpenses(expenseRepository.sumExpensesBetween(LocalDate.now(), LocalDate.now()))
                .monthExpenses(expenseRepository.sumExpensesBetween(LocalDate.now().withDayOfMonth(1), LocalDate.now()))
                .totalExpenses(expenseRepository.sumTotalExpenses())
                .todayProfit(orderRepository.sumRevenueBetween(todayStart, now).subtract(expenseRepository.sumExpensesBetween(LocalDate.now(), LocalDate.now())))
                .monthProfit(orderRepository.sumRevenueBetween(monthStart, now).subtract(expenseRepository.sumExpensesBetween(LocalDate.now().withDayOfMonth(1), LocalDate.now())))
                .build();
    }

    public List<DashboardResponse.TopProductResponse> getTopProducts(int limit) {
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        List<Object[]> results = orderItemRepository.findTopSellingProducts(monthStart, LocalDateTime.now(), limit);
        return results.stream().map(r -> DashboardResponse.TopProductResponse.builder()
                .productId(((Number) r[0]).longValue())
                .productName((String) r[1])
                .totalQuantity(((Number) r[2]).longValue())
                .totalRevenue((BigDecimal) r[3]).build()
        ).collect(Collectors.toList());
    }

    public List<DashboardResponse.SalesChartData> getSalesChart(int days) {
        LocalDateTime start = LocalDate.now().minusDays(days).atStartOfDay();
        List<Object[]> results = orderRepository.getDailySalesData(start, LocalDateTime.now());
        return results.stream().map(r -> DashboardResponse.SalesChartData.builder()
                .date(r[0].toString())
                .amount((BigDecimal) r[1]).build()
        ).collect(Collectors.toList());
    }
}
