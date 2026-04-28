package com.pos.backend.repository;

import com.pos.backend.entity.Payment;
import com.pos.backend.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrderId(Long orderId);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);
}
