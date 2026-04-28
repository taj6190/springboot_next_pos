package com.pos.backend.controller;

import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.repository.ExpenseRepository;
import com.pos.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final OrderRepository orderRepo;
    private final ExpenseRepository expenseRepo;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String,Object>>> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(23, 59, 59);

        BigDecimal revenue = orderRepo.sumRevenueBetween(start, end);
        long orders = orderRepo.countCompletedOrdersBetween(start, end);
        BigDecimal expenses = expenseRepo.sumExpensesBetween(from, to);
        BigDecimal profit = revenue.subtract(expenses);

        Map<String,Object> data = new LinkedHashMap<>();
        data.put("from", from);
        data.put("to", to);
        data.put("revenue", revenue);
        data.put("orders", orders);
        data.put("expenses", expenses);
        data.put("profit", profit);
        data.put("avgOrderValue", orders > 0 ? revenue.divide(BigDecimal.valueOf(orders), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO);

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<List<Map<String,Object>>>> getDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(23, 59, 59);

        List<Object[]> salesData = orderRepo.getDailySalesData(start, end);
        List<Map<String,Object>> result = new ArrayList<>();

        for (Object[] row : salesData) {
            Map<String,Object> day = new LinkedHashMap<>();
            LocalDate date = LocalDate.parse(row[0].toString());
            BigDecimal dayRevenue = (BigDecimal) row[1];
            BigDecimal dayExpenses = expenseRepo.sumExpensesBetween(date, date);

            day.put("date", date);
            day.put("revenue", dayRevenue);
            day.put("expenses", dayExpenses);
            day.put("profit", dayRevenue.subtract(dayExpenses));
            result.add(day);
        }

        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
