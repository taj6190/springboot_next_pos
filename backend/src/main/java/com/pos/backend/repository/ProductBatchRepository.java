package com.pos.backend.repository;

import com.pos.backend.entity.ProductBatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {

    List<ProductBatch> findByProductIdAndActiveTrue(Long productId);

    Page<ProductBatch> findByProductId(Long productId, Pageable pageable);

    @Query("SELECT b FROM ProductBatch b WHERE b.active = true AND b.expiryDate <= :date")
    List<ProductBatch> findExpiredBatches(@Param("date") LocalDate date);

    @Query("SELECT b FROM ProductBatch b WHERE b.active = true AND " +
            "b.expiryDate BETWEEN :start AND :end")
    List<ProductBatch> findExpiringBetween(@Param("start") LocalDate start,
                                           @Param("end") LocalDate end);

    @Query("SELECT b FROM ProductBatch b WHERE b.active = true AND b.availableQuantity > 0 " +
            "AND b.product.id = :productId ORDER BY b.expiryDate ASC")
    List<ProductBatch> findAvailableBatchesFifo(@Param("productId") Long productId);
}
