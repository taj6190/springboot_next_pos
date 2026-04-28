package com.pos.backend.entity;

import com.pos.backend.enums.DiscountType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Coupon entity for promotions and discounts.
 * Supports percentage and fixed-amount discounts with min purchase requirements.
 */
@Entity
@Table(name = "coupons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    /** Minimum cart subtotal required to use this coupon */
    @Column(precision = 10, scale = 2)
    private BigDecimal minPurchase;

    /** Maximum discount amount (caps percentage discounts) */
    @Column(precision = 10, scale = 2)
    private BigDecimal maxDiscount;

    /** Maximum number of times this coupon can be used (null = unlimited) */
    private Integer usageLimit;

    /** How many times this coupon has been used */
    @Builder.Default
    private Integer usageCount = 0;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Builder.Default
    private Boolean active = true;

    /** Check if coupon is currently valid */
    public boolean isValid() {
        if (!active) return false;
        if (usageLimit != null && usageCount >= usageLimit) return false;
        LocalDateTime now = LocalDateTime.now();
        if (startDate != null && now.isBefore(startDate)) return false;
        if (endDate != null && now.isAfter(endDate)) return false;
        return true;
    }

    /** Calculate the actual discount for a given subtotal */
    public BigDecimal calculateDiscount(BigDecimal subtotal) {
        if (minPurchase != null && subtotal.compareTo(minPurchase) < 0) return BigDecimal.ZERO;
        BigDecimal discount;
        if (discountType == DiscountType.PERCENTAGE) {
            discount = subtotal.multiply(discountValue).divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);
            if (maxDiscount != null && discount.compareTo(maxDiscount) > 0) {
                discount = maxDiscount;
            }
        } else {
            discount = discountValue;
        }
        return discount.min(subtotal);
    }
}
