package com.pos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ProductBatch entity for lot-level expiry and traceability.
 * Essential in Bangladesh where selling expired goods leads to
 * regulatory fines or shop closures.
 *
 * Each batch records the lot number, manufacture date, expiry date,
 * and the quantity received. Inventory tracks remaining quantity per batch per store.
 */
@Entity
@Table(name = "product_batches", indexes = {
        @Index(name = "idx_batch_number", columnList = "batch_number"),
        @Index(name = "idx_batch_product", columnList = "product_id"),
        @Index(name = "idx_batch_variant", columnList = "variant_id"),
        @Index(name = "idx_batch_expiry", columnList = "expiry_date"),
        @Index(name = "idx_batch_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductBatch extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Nullable — only set when the batch belongs to a specific variant. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    /** Supplier-assigned or internally generated lot/batch number. */
    @Column(name = "batch_number", nullable = false, length = 50)
    private String batchNumber;

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    /** Total quantity originally received in this batch. */
    @Column(name = "received_quantity", nullable = false)
    private Integer receivedQuantity;

    /** Remaining quantity (decremented on sale/damage/expiry write-off). */
    @Column(name = "available_quantity", nullable = false)
    @Builder.Default
    private Integer availableQuantity = 0;

    /** Purchase cost per unit for this batch — may differ across batches. */
    @Column(name = "cost_price", precision = 12, scale = 2)
    private BigDecimal costPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /** Returns true if this batch is past its expiry date. */
    public boolean isExpired() {
        return expiryDate != null && LocalDate.now().isAfter(expiryDate);
    }
}
