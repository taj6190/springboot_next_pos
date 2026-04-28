package com.pos.backend.repository;

import com.pos.backend.entity.Order;
import com.pos.backend.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Page<Order> findByCashierId(Long cashierId, Pageable pageable);

    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    List<Order> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT o FROM Order o WHERE " +
            "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Order> searchOrders(@Param("query") String query, Pageable pageable);

    // Dashboard queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status IN ('COMPLETED', 'PARTIALLY_RETURNED') AND o.createdAt BETWEEN :start AND :end")
    long countCompletedOrdersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN ('COMPLETED', 'PARTIALLY_RETURNED') AND o.createdAt BETWEEN :start AND :end")
    BigDecimal sumRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status IN ('COMPLETED', 'PARTIALLY_RETURNED')")
    long countCompleted();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN ('COMPLETED', 'PARTIALLY_RETURNED')")
    BigDecimal sumTotalRevenue();

    // Daily sales chart data
    @Query(value = "SELECT DATE(o.created_at) as sale_date, COALESCE(SUM(o.total_amount), 0) as total " +
            "FROM orders o WHERE o.status = 'COMPLETED' AND o.created_at BETWEEN :start AND :end " +
            "GROUP BY DATE(o.created_at) ORDER BY sale_date", nativeQuery = true)
    List<Object[]> getDailySalesData(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
