package com.pos.backend.repository;

import com.pos.backend.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Page<Inventory> findByStoreId(Long storeId, Pageable pageable);

    Page<Inventory> findByProductId(Long productId, Pageable pageable);

    Optional<Inventory> findByStoreIdAndProductIdAndVariantIsNullAndBatchIsNull(
            Long storeId, Long productId);

    Optional<Inventory> findByStoreIdAndProductIdAndVariantId(
            Long storeId, Long productId, Long variantId);

    Optional<Inventory> findByStoreIdAndProductIdAndBatchId(
            Long storeId, Long productId, Long batchId);

    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId AND i.quantity <= i.reorderPoint")
    List<Inventory> findReorderNeeded(@Param("storeId") Long storeId);

    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId AND i.quantity <= i.minThreshold")
    List<Inventory> findLowStock(@Param("storeId") Long storeId);

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Inventory i WHERE i.product.id = :productId")
    int sumQuantityByProductId(@Param("productId") Long productId);
}
