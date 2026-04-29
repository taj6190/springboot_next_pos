package com.pos.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pos.backend.entity.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    // Top selling products
    @Query(value = "SELECT oi.product_id, oi.product_name, SUM(oi.quantity) as total_qty, SUM(oi.total_price) as total_revenue "
            + "FROM order_items oi JOIN orders o ON oi.order_id = o.id "
            + "WHERE o.status = 'COMPLETED' AND o.created_at BETWEEN :start AND :end "
            + "GROUP BY oi.product_id, oi.product_name ORDER BY total_qty DESC", nativeQuery = true)
    List<Object[]> findTopSellingProducts(@Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            org.springframework.data.domain.Pageable pageable);
}
