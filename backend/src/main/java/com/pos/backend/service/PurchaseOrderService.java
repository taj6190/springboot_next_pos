package com.pos.backend.service;

import com.pos.backend.dto.request.PurchaseOrderRequest;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.dto.response.PurchaseOrderResponse;
import com.pos.backend.entity.*;
import com.pos.backend.enums.InventoryReason;
import com.pos.backend.enums.PurchaseOrderStatus;
import com.pos.backend.exception.BadRequestException;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final SupplierService supplierService;

    private static final AtomicLong poCounter = new AtomicLong(100);

    public PagedResponse<PurchaseOrderResponse> getAllPurchaseOrders(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PurchaseOrder> poPage;
        if (status != null && !status.trim().isEmpty()) {
            poPage = purchaseOrderRepository.findByStatus(PurchaseOrderStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            poPage = purchaseOrderRepository.findAll(pageable);
        }
        return PagedResponse.<PurchaseOrderResponse>builder()
                .content(poPage.getContent().stream().map(this::mapToResponse).toList())
                .page(poPage.getNumber()).size(poPage.getSize())
                .totalElements(poPage.getTotalElements()).totalPages(poPage.getTotalPages())
                .last(poPage.isLast()).first(poPage.isFirst()).build();
    }

    public PurchaseOrderResponse getPurchaseOrderById(Long id) {
        return mapToResponse(purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id)));
    }

    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest req) {
        Supplier supplier = supplierRepository.findById(req.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", req.getSupplierId()));

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(generatePoNumber()).supplier(supplier)
                .expectedDate(req.getExpectedDate()).notes(req.getNotes())
                .status(PurchaseOrderStatus.ORDERED).build();

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseOrderRequest.PurchaseOrderItemRequest itemReq : req.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));
            BigDecimal totalCost = itemReq.getUnitCost().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .product(product).quantity(itemReq.getQuantity())
                    .unitCost(itemReq.getUnitCost()).totalCost(totalCost).build();
            po.addItem(item);
            total = total.add(totalCost);
        }
        po.setTotalAmount(total);
        return mapToResponse(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponse receivePurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
        if (po.getStatus() == PurchaseOrderStatus.RECEIVED || po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new BadRequestException("Purchase order is already " + po.getStatus().name().toLowerCase());
        }
        for (PurchaseOrderItem item : po.getItems()) {
            int remaining = item.getQuantity() - item.getReceivedQuantity();
            if (remaining > 0) {
                item.setReceivedQuantity(item.getQuantity());
                inventoryService.logInventoryChange(item.getProduct(), remaining,
                        InventoryReason.PURCHASE_RECEIVED, "PURCHASE_ORDER", po.getId(),
                        "PO #" + po.getPoNumber());
            }
        }
        po.setStatus(PurchaseOrderStatus.RECEIVED);
        po.setReceivedAt(LocalDateTime.now());
        return mapToResponse(purchaseOrderRepository.save(po));
    }

    @Transactional
    public void cancelPurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
        if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new BadRequestException("Cannot cancel a received purchase order");
        }
        po.setStatus(PurchaseOrderStatus.CANCELLED);
        purchaseOrderRepository.save(po);
    }

    private String generatePoNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "PO-" + datePart + "-" + poCounter.incrementAndGet();
    }

    private PurchaseOrderResponse mapToResponse(PurchaseOrder po) {
        List<PurchaseOrderResponse.PurchaseOrderItemResponse> items = po.getItems().stream()
                .map(i -> PurchaseOrderResponse.PurchaseOrderItemResponse.builder()
                        .id(i.getId()).productId(i.getProduct().getId())
                        .productName(i.getProduct().getName()).productSku(i.getProduct().getSku())
                        .quantity(i.getQuantity()).receivedQuantity(i.getReceivedQuantity())
                        .unitCost(i.getUnitCost()).totalCost(i.getTotalCost()).build())
                .toList();
        return PurchaseOrderResponse.builder()
                .id(po.getId()).poNumber(po.getPoNumber())
                .supplier(supplierService.mapToResponse(po.getSupplier()))
                .items(items).totalAmount(po.getTotalAmount()).status(po.getStatus().name())
                .expectedDate(po.getExpectedDate()).receivedAt(po.getReceivedAt())
                .notes(po.getNotes()).createdAt(po.getCreatedAt()).build();
    }
}
