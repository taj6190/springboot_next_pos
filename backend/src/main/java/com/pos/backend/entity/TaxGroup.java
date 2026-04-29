package com.pos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * TaxGroup entity representing a named collection of tax rules.
 * Products link to a TaxGroup to determine all applicable taxes
 * (e.g., "Cosmetics Full Tax" = 15% VAT + 20% Supplementary Duty).
 */
@Entity
@Table(name = "tax_groups", indexes = {
        @Index(name = "idx_tax_group_name", columnList = "name", unique = true),
        @Index(name = "idx_tax_group_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxGroup extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 300)
    private String description;

    @OneToMany(mappedBy = "taxGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("sortOrder ASC")
    private List<Tax> taxes = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /** Helper to add a tax entry maintaining bidirectional relationship. */
    public void addTax(Tax tax) {
        taxes.add(tax);
        tax.setTaxGroup(this);
    }

    public void removeTax(Tax tax) {
        taxes.remove(tax);
        tax.setTaxGroup(null);
    }
}
