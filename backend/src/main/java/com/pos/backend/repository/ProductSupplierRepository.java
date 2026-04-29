package com.pos.backend.repository;

import com.pos.backend.entity.ProductSupplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductSupplierRepository extends JpaRepository<ProductSupplier, Long> {

    List<ProductSupplier> findByProductId(Long productId);

    List<ProductSupplier> findBySupplierId(Long supplierId);

    Optional<ProductSupplier> findByProductIdAndSupplierId(Long productId, Long supplierId);

    Optional<ProductSupplier> findByProductIdAndPreferredTrue(Long productId);

    boolean existsByProductIdAndSupplierId(Long productId, Long supplierId);
}
