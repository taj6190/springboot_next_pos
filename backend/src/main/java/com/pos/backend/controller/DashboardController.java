package com.pos.backend.controller;

import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.DashboardResponse;
import com.pos.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardStats()));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<DashboardResponse.TopProductResponse>>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getTopProducts(limit)));
    }

    @GetMapping("/sales-chart")
    public ResponseEntity<ApiResponse<List<DashboardResponse.SalesChartData>>> getSalesChart(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSalesChart(days)));
    }
}
