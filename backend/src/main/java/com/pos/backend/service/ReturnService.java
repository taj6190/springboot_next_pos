package com.pos.backend.service;

import com.pos.backend.entity.*;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.*;
import com.pos.backend.dto.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ProductReturnRepository returnRepo;
    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;

    private static long returnCounter = 1000;

    public PagedResponse<Map<String,Object>> getAll(int page, int size, String search, String status) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ProductReturn> pg;
        if (status != null && !status.isEmpty()) {
            pg = returnRepo.findByStatus(ProductReturn.ReturnStatus.valueOf(status), p);
        } else if (search != null && !search.isEmpty()) {
            pg = returnRepo.search(search, p);
        } else {
            pg = returnRepo.findAll(p);
        }
        return PagedResponse.<Map<String,Object>>builder()
                .content(pg.getContent().stream().map(this::toMap).toList())
                .page(pg.getNumber()).size(pg.getSize())
                .totalElements(pg.getTotalElements()).totalPages(pg.getTotalPages())
                .last(pg.isLast()).first(pg.isFirst()).build();
    }

    public Map<String,Object> getById(Long id) {
        return toMap(returnRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Return","id",id)));
    }

    @Transactional
    public Map<String,Object> create(Map<String,Object> req) {
        Long orderId = Long.valueOf(req.get("orderId").toString());
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order","id",orderId));

        ProductReturn ret = ProductReturn.builder()
                .returnNumber("RET-" + System.currentTimeMillis())
                .order(order)
                .reason((String) req.get("reason"))
                .notes((String) req.get("notes"))
                .status(ProductReturn.ReturnStatus.PENDING)
                .build();

        BigDecimal totalRefund = BigDecimal.ZERO;
        @SuppressWarnings("unchecked")
        List<Map<String,Object>> items = (List<Map<String,Object>>) req.get("items");
        for (Map<String,Object> item : items) {
            Long productId = Long.valueOf(item.get("productId").toString());
            int qty = Integer.parseInt(item.get("quantity").toString());
            Product product = productRepo.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product","id",productId));

            BigDecimal unitPrice = product.getSellingPrice();
            ReturnItem ri = ReturnItem.builder()
                    .productReturn(ret)
                    .product(product)
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .reason((String) item.get("reason"))
                    .restock(item.get("restock") != null ? (Boolean) item.get("restock") : true)
                    .build();
            ret.getItems().add(ri);
            totalRefund = totalRefund.add(unitPrice.multiply(BigDecimal.valueOf(qty)));
        }

        ret.setRefundAmount(totalRefund);
        if (req.get("refundMethod") != null) {
            ret.setRefundMethod(ProductReturn.RefundMethod.valueOf((String) req.get("refundMethod")));
        }
        return toMap(returnRepo.save(ret));
    }

    @Transactional
    public Map<String,Object> approve(Long id) {
        ProductReturn ret = returnRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Return","id",id));
        ret.setStatus(ProductReturn.ReturnStatus.APPROVED);
        ret.setProcessedAt(LocalDateTime.now());

        // Restock items
        for (ReturnItem ri : ret.getItems()) {
            if (ri.getRestock()) {
                Product p = ri.getProduct();
                p.setStock(p.getStock() + ri.getQuantity());
                productRepo.save(p);
            }
        }

        ret.setStatus(ProductReturn.ReturnStatus.REFUNDED);
        return toMap(returnRepo.save(ret));
    }

    @Transactional
    public Map<String,Object> reject(Long id, String reason) {
        ProductReturn ret = returnRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Return","id",id));
        ret.setStatus(ProductReturn.ReturnStatus.REJECTED);
        ret.setProcessedAt(LocalDateTime.now());
        if (reason != null) ret.setNotes(reason);
        return toMap(returnRepo.save(ret));
    }

    private Map<String,Object> toMap(ProductReturn r) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("returnNumber", r.getReturnNumber());
        m.put("orderNumber", r.getOrder().getOrderNumber());
        m.put("orderId", r.getOrder().getId());
        m.put("status", r.getStatus().name());
        m.put("refundAmount", r.getRefundAmount());
        m.put("refundMethod", r.getRefundMethod() != null ? r.getRefundMethod().name() : null);
        m.put("reason", r.getReason());
        m.put("notes", r.getNotes());
        m.put("processedBy", r.getProcessedBy());
        m.put("processedAt", r.getProcessedAt());
        m.put("createdAt", r.getCreatedAt());
        List<Map<String,Object>> items = new ArrayList<>();
        for (ReturnItem ri : r.getItems()) {
            Map<String,Object> im = new LinkedHashMap<>();
            im.put("id", ri.getId());
            im.put("productId", ri.getProduct().getId());
            im.put("productName", ri.getProduct().getName());
            im.put("quantity", ri.getQuantity());
            im.put("unitPrice", ri.getUnitPrice());
            im.put("reason", ri.getReason());
            im.put("restock", ri.getRestock());
            items.add(im);
        }
        m.put("items", items);
        return m;
    }
}
