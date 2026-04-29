package com.pos.backend.repository;

import com.pos.backend.entity.TaxGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaxGroupRepository extends JpaRepository<TaxGroup, Long> {

    Optional<TaxGroup> findByName(String name);

    boolean existsByName(String name);

    Page<TaxGroup> findByActiveTrue(Pageable pageable);
}
