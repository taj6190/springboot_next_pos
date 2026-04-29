package com.pos.backend.entity;

import com.pos.backend.enums.TaxType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Tax entity representing an individual tax rule within a TaxGroup.
 * Supports VAT (standard 15% in Bangladesh), supplementary duties for
 * luxury/cosmetics items, customs duty, and other tax types.
 */
@Entity
@Table(name = "taxes", indexes = {
        @Index(name = "idx_tax_group_id", columnList = "tax_group_id"),
        @Index(name = "idx_tax_type", columnList = "type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tax extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_group_id", nullable = false)
    private TaxGroup taxGroup;

    /** Display name (e.g., "VAT", "Supplementary Duty — Cosmetics"). */
    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TaxType type;

    /** Tax rate as a percentage (e.g., 15.00 for 15%). */
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal rate;

    @Column(length = 300)
    private String description;

    /**
     * Whether this tax is compound — i.e., calculated on top of
     * the subtotal + previously applied taxes in the group.
     */
    @Column(name = "is_compound", nullable = false)
    @Builder.Default
    private Boolean isCompound = false;

    /** Controls evaluation order within the TaxGroup. */
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
