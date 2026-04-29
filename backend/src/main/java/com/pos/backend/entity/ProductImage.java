package com.pos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ProductImage entity for managing a gallery of Cloudinary-hosted images.
 * Stores both the URL (for display) and the publicId (for deletion/transformation).
 * Supports ordering via sortOrder and a primary flag for the hero image.
 */
@Entity
@Table(name = "product_images", indexes = {
        @Index(name = "idx_pimg_product", columnList = "product_id"),
        @Index(name = "idx_pimg_sort_order", columnList = "sort_order")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Cloudinary secure URL for the image. */
    @Column(nullable = false, length = 500)
    private String url;

    /** Cloudinary public ID — required for efficient deletion and transformations. */
    @Column(name = "public_id", nullable = false, length = 200)
    private String publicId;

    @Column(name = "alt_text", length = 200)
    private String altText;

    /** Display order — lower values render first. */
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    /** Whether this is the primary/hero image shown in list views. */
    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;
}
