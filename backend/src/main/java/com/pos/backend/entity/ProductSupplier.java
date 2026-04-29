package com.pos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * ProductSupplier entity — decouples supplier pricing, lead times,
 * and preference flags from the product master.
 * Enables tracking of purchase costs per supplier and automating purchase orders.
 */
@Entity
@Table(name = "product_suppliers", indexes = {
        @Index(name = "idx_ps_product", columnList = "product_id"),
        @Index(name = "idx_ps_supplier", columnList = "supplier_id"),
        @Index(name = "idx_ps_preferred", columnList = "preferred")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_product_supplier", columnNames = {"product_id", "supplier_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSupplier extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    /** The price this supplier charges for one unit. */
    @Column(name = "purchase_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal purchasePrice;

    /** Average lead time in calendar days from order to delivery. */
    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    /** Minimum order quantity accepted by this supplier. */
    @Column(name = "min_order_quantity")
    @Builder.Default
    private Integer minOrderQuantity = 1;

    /** Whether this is the preferred/default supplier for this product. */
    @Column(nullable = false)
    @Builder.Default
    private Boolean preferred = false;

    /** The supplier's own SKU/part number for this product. */
    @Column(name = "supplier_sku", length = 50)
    private String supplierSku;

    @Column(length = 500)
    private String notes;
}
