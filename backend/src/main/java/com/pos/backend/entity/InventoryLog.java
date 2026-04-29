package com.pos.backend.entity;

import com.pos.backend.enums.InventoryReason;
import jakarta.persistence.*;
import lombok.*;

/**
 * InventoryLog entity for tracking all stock movements.
 * Provides full audit trail for inventory changes across stores,
 * with optional variant and batch-level granularity.
 */
@Entity
@Table(name = "inventory_logs", indexes = {
        @Index(name = "idx_inv_log_product", columnList = "product_id"),
        @Index(name = "idx_inv_log_store", columnList = "store_id"),
        @Index(name = "idx_inv_log_reason", columnList = "reason"),
        @Index(name = "idx_inv_log_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Nullable — set when the movement relates to a specific variant. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    /** Nullable — set when the movement relates to a specific batch/lot. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;

    /** Nullable — set in multi-store deployments. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange;

    @Column(name = "previous_stock", nullable = false)
    private Integer previousStock;

    @Column(name = "new_stock", nullable = false)
    private Integer newStock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InventoryReason reason;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
