package com.pos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Product entity — the master record for items available for sale.
 * Supports barcode scanning, SKU tracking, HS Code for customs,
 * MRP pricing, tax groups, Cloudinary image galleries, variant-aware
 * catalogue management, and batch/lot-level expiry tracking.
 *
 * <p><strong>Note:</strong> The {@code stock} and {@code minStock} fields are retained
 * for backward compatibility with the single-store workflow. For multi-store
 * deployments, use the {@link Inventory} entity as the source of truth.</p>
 */
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_sku", columnList = "sku", unique = true),
        @Index(name = "idx_product_barcode", columnList = "barcode"),
        @Index(name = "idx_product_name", columnList = "name"),
        @Index(name = "idx_product_category", columnList = "category_id"),
        @Index(name = "idx_product_active", columnList = "active"),
        @Index(name = "idx_product_hs_code", columnList = "hs_code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(length = 100)
    private String barcode;

    @Column(length = 1000)
    private String description;

    /* ---------- Pricing ---------- */

    @Column(name = "cost_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "selling_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    /** Maximum Retail Price — still widely used in Bangladesh for consumer protection. */
    @Column(precision = 12, scale = 2)
    private BigDecimal mrp;

    /* ---------- Stock (single-store legacy) ---------- */

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(name = "min_stock", nullable = false)
    @Builder.Default
    private Integer minStock = 5;

    /* ---------- Images (legacy single-image field retained for backward compat) ---------- */

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_public_id")
    private String imagePublicId;

    /* ---------- Classification ---------- */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 50)
    private String unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    /* ---------- Physical attributes ---------- */

    /** Weight in grams/kg/ml/L depending on weightUnit. */
    @Column(precision = 10, scale = 3)
    private BigDecimal weight;

    @Column(name = "weight_unit", length = 20)
    private String weightUnit;

    /** Whether this product is sold by weight (price per kg/g). */
    @Builder.Default
    @Column(name = "sold_by_weight")
    private Boolean soldByWeight = false;

    /** Whether expiry date tracking is enabled for this product. */
    @Builder.Default
    @Column(name = "expiry_tracking")
    private Boolean expiryTracking = false;

    /* ---------- Tax ---------- */

    /** Legacy flat tax rate — retained for backward compatibility. */
    @Column(name = "tax_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.ZERO;

    /**
     * Tax group for compliant invoice calculations.
     * When set, this takes precedence over the flat {@code taxRate} field.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_group_id")
    private TaxGroup taxGroup;

    /* ---------- Regulatory / Customs ---------- */

    /**
     * Harmonised System Code — required for customs valuation,
     * export/import documentation, and regulatory reporting in Bangladesh.
     */
    @Column(name = "hs_code", length = 20)
    private String hsCode;

    /* ---------- Soft delete ---------- */

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /* ---------- Collections ---------- */

    @org.hibernate.annotations.BatchSize(size = 20)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @OrderBy("sortOrder ASC")
    private List<ProductImage> images = new ArrayList<>();

    @org.hibernate.annotations.BatchSize(size = 20)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @org.hibernate.annotations.BatchSize(size = 20)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @OrderBy("expiryDate ASC")
    private List<ProductBatch> batches = new ArrayList<>();

    @org.hibernate.annotations.BatchSize(size = 20)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductSupplier> productSuppliers = new ArrayList<>();
}
