package com.pos.backend.repository;

import com.pos.backend.entity.Tax;
import com.pos.backend.enums.TaxType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaxRepository extends JpaRepository<Tax, Long> {

    List<Tax> findByTaxGroupIdAndActiveTrue(Long taxGroupId);

    List<Tax> findByTypeAndActiveTrue(TaxType type);
}
