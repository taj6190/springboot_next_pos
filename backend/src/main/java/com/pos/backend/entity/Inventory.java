package com.pos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Inventory entity — decouples stock quantities from the product master.
 * Tracks quantity per store, per product (and optionally per variant and batch),
 * along with reorder points and min/max thresholds.
 *
 * This avoids concurrency issues on the Product table during high-volume
 * sales and allows each store to independently manage its own stock levels.
 */
@Entity
@Table(name = "inventory", indexes = {
        @Index(name = "idx_inv_store", columnList = "store_id"),
        @Index(name = "idx_inv_product", columnList = "product_id"),
        @Index(name = "idx_inv_variant", columnList = "variant_id"),
        @Index(name = "idx_inv_batch", columnList = "batch_id")
}, uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_inventory_composite",
                columnNames = {"store_id", "product_id", "variant_id", "batch_id"}
        )
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Nullable — set only when tracking inventory at the variant level. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    /** Nullable — set only when tracking inventory at the batch/lot level. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;

    /** Current available quantity on hand. */
    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    /** Quantity reserved for pending/processing orders (not yet shipped). */
    @Column(name = "reserved_quantity", nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;

    /** When quantity falls to this level, a reorder alert is triggered. */
    @Column(name = "reorder_point", nullable = false)
    @Builder.Default
    private Integer reorderPoint = 10;

    /** Minimum stock level — triggers urgent low-stock warnings. */
    @Column(name = "min_threshold", nullable = false)
    @Builder.Default
    private Integer minThreshold = 5;

    /** Maximum stock capacity for this product at this store. */
    @Column(name = "max_threshold", nullable = false)
    @Builder.Default
    private Integer maxThreshold = 1000;

    /** Returns the sellable quantity (on hand minus reserved). */
    public int getAvailableQuantity() {
        return quantity - reservedQuantity;
    }

    /** Returns true if stock is at or below the reorder point. */
    public boolean needsReorder() {
        return quantity <= reorderPoint;
    }

    /** Returns true if stock is at or below the minimum threshold. */
    public boolean isLowStock() {
        return quantity <= minThreshold;
    }
}
