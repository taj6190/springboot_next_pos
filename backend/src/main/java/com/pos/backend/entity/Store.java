package com.pos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Store entity representing a physical retail location.
 * Each store maintains its own inventory quantities, reorder points, and thresholds.
 */
@Entity
@Table(name = "stores", indexes = {
        @Index(name = "idx_store_code", columnList = "code", unique = true),
        @Index(name = "idx_store_name", columnList = "name"),
        @Index(name = "idx_store_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    /** Unique store code for internal reference (e.g., "DHAKA-01"). */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(length = 500)
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    /** Store manager — nullable for stores without an assigned manager. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
