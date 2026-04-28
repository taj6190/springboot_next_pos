package com.pos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Brand entity — separate manageable entity like Category.
 */
@Entity
@Table(name = "brands", indexes = {
    @Index(name = "idx_brand_name", columnList = "name", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Brand extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
