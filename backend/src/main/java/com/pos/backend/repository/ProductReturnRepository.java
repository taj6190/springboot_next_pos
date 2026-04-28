package com.pos.backend.repository;

import com.pos.backend.entity.ProductReturn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductReturnRepository extends JpaRepository<ProductReturn, Long> {

    Optional<ProductReturn> findByReturnNumber(String returnNumber);

    @Query("SELECT r FROM ProductReturn r WHERE r.returnNumber LIKE %:q% OR r.reason LIKE %:q%")
    Page<ProductReturn> search(@Param("q") String query, Pageable pageable);

    Page<ProductReturn> findByStatus(ProductReturn.ReturnStatus status, Pageable pageable);

    long countByStatus(ProductReturn.ReturnStatus status);
}
