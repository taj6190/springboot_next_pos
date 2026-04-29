package com.pos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * ProductVariant entity — enables variant-aware catalogue management.
 * A single product (e.g., "Lipstick") can have many variants
 * (e.g., 20 shades × 2 sizes), each with its own SKU, barcode, and price.
 *
 * Uses the Shopify-style option1/option2 pattern for flexibility
 * without requiring a separate attribute-value join table.
 */
@Entity
@Table(name = "product_variants", indexes = {
        @Index(name = "idx_variant_sku", columnList = "sku", unique = true),
        @Index(name = "idx_variant_barcode", columnList = "barcode"),
        @Index(name = "idx_variant_product", columnList = "product_id"),
        @Index(name = "idx_variant_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Auto-generated or manually assigned unique SKU for this variant. */
    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(length = 100)
    private String barcode;

    /** Human-readable variant label (e.g., "Ruby Red / 5ml"). */
    @Column(name = "variant_name", nullable = false, length = 200)
    private String variantName;

    /* ---------- Option axes (up to 2 dimensions) ---------- */

    @Column(name = "option1_name", length = 50)
    private String option1Name;

    @Column(name = "option1_value", length = 100)
    private String option1Value;

    @Column(name = "option2_name", length = 50)
    private String option2Name;

    @Column(name = "option2_value", length = 100)
    private String option2Value;

    /* ---------- Pricing ---------- */

    @Column(name = "cost_price", precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "selling_price", precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    /** Maximum Retail Price — still widely used in Bangladesh. */
    @Column(precision = 12, scale = 2)
    private BigDecimal mrp;

    /* ---------- Physical attributes ---------- */

    @Column(precision = 10, scale = 3)
    private BigDecimal weight;

    @Column(name = "weight_unit", length = 20)
    private String weightUnit;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_public_id")
    private String imagePublicId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
