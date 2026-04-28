package com.pos.backend.controller;

import com.pos.backend.dto.request.OrderRequest;
import com.pos.backend.dto.request.ReturnRequest;
import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.OrderResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(page, size, search, status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getByNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderByNumber(orderNumber)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Order created", orderService.createOrder(request)));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<OrderResponse>> processReturn(@PathVariable Long id, @Valid @RequestBody ReturnRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Return processed", orderService.processReturn(id, request)));
    }
}
