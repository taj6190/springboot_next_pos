package com.pos.backend.controller;

import com.pos.backend.dto.request.CouponRequest;
import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.CouponResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<CouponResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons(page, size, search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getCouponById(id)));
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<CouponResponse>> validate(
            @RequestParam String code, @RequestParam BigDecimal subtotal) {
        return ResponseEntity.ok(ApiResponse.success("Coupon valid", couponService.validateCoupon(code, subtotal)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>> create(@Valid @RequestBody CouponRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Coupon created", couponService.createCoupon(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> update(@PathVariable Long id, @Valid @RequestBody CouponRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Coupon updated", couponService.updateCoupon(id, req)));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggle(@PathVariable Long id) {
        couponService.toggleCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon toggled"));
    }
}
