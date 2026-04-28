package com.pos.backend.service;

import com.pos.backend.dto.request.CouponRequest;
import com.pos.backend.dto.response.CouponResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.entity.Coupon;
import com.pos.backend.enums.DiscountType;
import com.pos.backend.exception.*;
import com.pos.backend.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public PagedResponse<CouponResponse> getAllCoupons(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Coupon> p = (search != null && !search.isEmpty())
                ? couponRepository.searchCoupons(search, pageable)
                : couponRepository.findAll(pageable);
        return PagedResponse.<CouponResponse>builder()
                .content(p.getContent().stream().map(this::mapToResponse).toList())
                .page(p.getNumber()).size(p.getSize())
                .totalElements(p.getTotalElements()).totalPages(p.getTotalPages())
                .last(p.isLast()).first(p.isFirst()).build();
    }

    public CouponResponse getCouponById(Long id) {
        return mapToResponse(couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id)));
    }

    /** Validate a coupon code and return its discount for a given subtotal */
    public CouponResponse validateCoupon(String code, BigDecimal subtotal) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));
        if (!coupon.isValid()) throw new BadRequestException("Coupon is expired or no longer valid");
        if (coupon.getMinPurchase() != null && subtotal.compareTo(coupon.getMinPurchase()) < 0) {
            throw new BadRequestException("Minimum purchase of $" + coupon.getMinPurchase() + " required");
        }
        CouponResponse res = mapToResponse(coupon);
        res.setDiscountValue(coupon.calculateDiscount(subtotal));
        return res;
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest req) {
        if (couponRepository.existsByCode(req.getCode().toUpperCase())) {
            throw new DuplicateResourceException("Coupon", "code", req.getCode());
        }
        Coupon c = Coupon.builder()
                .code(req.getCode().toUpperCase())
                .description(req.getDescription())
                .discountType(DiscountType.valueOf(req.getDiscountType().toUpperCase()))
                .discountValue(req.getDiscountValue())
                .minPurchase(req.getMinPurchase())
                .maxDiscount(req.getMaxDiscount())
                .usageLimit(req.getUsageLimit())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .build();
        return mapToResponse(couponRepository.save(c));
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest req) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        c.setCode(req.getCode().toUpperCase());
        c.setDescription(req.getDescription());
        c.setDiscountType(DiscountType.valueOf(req.getDiscountType().toUpperCase()));
        c.setDiscountValue(req.getDiscountValue());
        c.setMinPurchase(req.getMinPurchase());
        c.setMaxDiscount(req.getMaxDiscount());
        c.setUsageLimit(req.getUsageLimit());
        c.setStartDate(req.getStartDate());
        c.setEndDate(req.getEndDate());
        return mapToResponse(couponRepository.save(c));
    }

    @Transactional
    public void toggleCoupon(Long id) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        c.setActive(!c.getActive());
        couponRepository.save(c);
    }

    /** Called by OrderService after successful checkout to increment usage */
    @Transactional
    public void incrementUsage(String code) {
        Coupon c = couponRepository.findByCode(code.toUpperCase()).orElse(null);
        if (c != null) { c.setUsageCount(c.getUsageCount() + 1); couponRepository.save(c); }
    }

    public CouponResponse mapToResponse(Coupon c) {
        return CouponResponse.builder()
                .id(c.getId()).code(c.getCode()).description(c.getDescription())
                .discountType(c.getDiscountType().name()).discountValue(c.getDiscountValue())
                .minPurchase(c.getMinPurchase()).maxDiscount(c.getMaxDiscount())
                .usageLimit(c.getUsageLimit()).usageCount(c.getUsageCount())
                .startDate(c.getStartDate()).endDate(c.getEndDate())
                .active(c.getActive()).valid(c.isValid()).createdAt(c.getCreatedAt()).build();
    }
}
