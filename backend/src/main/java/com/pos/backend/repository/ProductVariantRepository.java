package com.pos.backend.repository;

import com.pos.backend.entity.ProductVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductIdAndActiveTrue(Long productId);

    Optional<ProductVariant> findBySku(String sku);

    Optional<ProductVariant> findByBarcode(String barcode);

    boolean existsBySku(String sku);

    boolean existsByBarcode(String barcode);

    @Query("SELECT v FROM ProductVariant v WHERE v.product.id = :productId AND v.active = true AND " +
            "(LOWER(v.variantName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(v.sku) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<ProductVariant> searchVariants(@Param("productId") Long productId,
                                        @Param("q") String query, Pageable pageable);
}
