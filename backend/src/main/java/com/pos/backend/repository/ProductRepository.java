package com.pos.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.pos.backend.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    Optional<Product> findByBarcode(String barcode);

    boolean existsBySku(String sku);

    boolean existsByBarcode(String barcode);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category", "brand", "taxGroup"})
    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.active = true AND p.stock <= p.minStock")
    List<Product> findLowStockProducts();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category", "brand", "taxGroup"})
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.active = true AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "p.barcode LIKE CONCAT('%', :query, '%') OR " +
            "p.hsCode LIKE CONCAT('%', :query, '%'))")
    Page<Product> searchProducts(@org.springframework.data.repository.query.Param("query") String query, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category", "brand", "taxGroup"})
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.active = true")
    Page<Product> findAllActive(Pageable pageable);

    List<Product> findByHsCode(String hsCode);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true")
    long countActive();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true AND p.stock <= p.minStock")
    long countLowStock();
}
