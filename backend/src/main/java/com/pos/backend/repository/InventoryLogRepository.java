package com.pos.backend.repository;

import com.pos.backend.entity.InventoryLog;
import com.pos.backend.enums.InventoryReason;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {

    Page<InventoryLog> findByProductId(Long productId, Pageable pageable);

    List<InventoryLog> findByProductIdOrderByCreatedAtDesc(Long productId);

    Page<InventoryLog> findByReason(InventoryReason reason, Pageable pageable);
}
