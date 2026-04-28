package com.pos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Supplier entity representing product suppliers/vendors.
 */
@Entity
@Table(name = "suppliers", indexes = {
        @Index(name = "idx_supplier_email", columnList = "email"),
        @Index(name = "idx_supplier_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String company;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
