package com.pos.backend.repository;

import com.pos.backend.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {

    Optional<Store> findByCode(String code);

    boolean existsByCode(String code);

    Page<Store> findByActiveTrue(Pageable pageable);

    @Query("SELECT s FROM Store s WHERE s.active = true AND " +
            "(LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(s.code) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Store> searchStores(@Param("q") String query, Pageable pageable);
}
