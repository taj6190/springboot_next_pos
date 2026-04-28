package com.pos.backend.service;

import com.pos.backend.dto.request.InventoryAdjustmentRequest;
import com.pos.backend.dto.response.InventoryLogResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.entity.InventoryLog;
import com.pos.backend.entity.Product;
import com.pos.backend.entity.User;
import com.pos.backend.enums.InventoryReason;
import com.pos.backend.exception.BadRequestException;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.InventoryLogRepository;
import com.pos.backend.repository.ProductRepository;
import com.pos.backend.repository.UserRepository;
import com.pos.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryLogRepository inventoryLogRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public PagedResponse<InventoryLogResponse> getAllLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<InventoryLog> logPage = inventoryLogRepository.findAll(pageable);
        return buildPagedResponse(logPage);
    }

    public PagedResponse<InventoryLogResponse> getLogsByProduct(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<InventoryLog> logPage = inventoryLogRepository.findByProductId(productId, pageable);
        return buildPagedResponse(logPage);
    }

    @Transactional
    public InventoryLogResponse adjustInventory(InventoryAdjustmentRequest req) {
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", req.getProductId()));

        InventoryReason reason;
        try {
            reason = InventoryReason.valueOf(req.getReason().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid reason: " + req.getReason());
        }

        int previousStock = product.getStock();
        int newStock = previousStock + req.getQuantityChange();
        if (newStock < 0) {
            throw new BadRequestException("Adjustment would result in negative stock");
        }

        product.setStock(newStock);
        productRepository.save(product);

        User currentUser = getCurrentUser();

        InventoryLog log = InventoryLog.builder()
                .product(product).quantityChange(req.getQuantityChange())
                .previousStock(previousStock).newStock(newStock)
                .reason(reason).notes(req.getNotes()).user(currentUser)
                .referenceType("MANUAL_ADJUSTMENT").build();
        log = inventoryLogRepository.save(log);
        return mapToResponse(log);
    }

    /**
     * Internal method used by OrderService to log inventory changes.
     */
    @Transactional
    public void logInventoryChange(Product product, int quantityChange, InventoryReason reason,
                                   String referenceType, Long referenceId, String notes) {
        int previousStock = product.getStock();
        int newStock = previousStock + quantityChange;
        product.setStock(newStock);
        productRepository.save(product);

        User currentUser = getCurrentUser();
        InventoryLog log = InventoryLog.builder()
                .product(product).quantityChange(quantityChange)
                .previousStock(previousStock).newStock(newStock)
                .reason(reason).referenceType(referenceType)
                .referenceId(referenceId).notes(notes).user(currentUser).build();
        inventoryLogRepository.save(log);
    }

    private User getCurrentUser() {
        try {
            CustomUserDetails ud = (CustomUserDetails) SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();
            return userRepository.findById(ud.getId()).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private PagedResponse<InventoryLogResponse> buildPagedResponse(Page<InventoryLog> logPage) {
        return PagedResponse.<InventoryLogResponse>builder()
                .content(logPage.getContent().stream().map(this::mapToResponse).toList())
                .page(logPage.getNumber()).size(logPage.getSize())
                .totalElements(logPage.getTotalElements()).totalPages(logPage.getTotalPages())
                .last(logPage.isLast()).first(logPage.isFirst()).build();
    }

    private InventoryLogResponse mapToResponse(InventoryLog log) {
        return InventoryLogResponse.builder()
                .id(log.getId()).productId(log.getProduct().getId())
                .productName(log.getProduct().getName()).productSku(log.getProduct().getSku())
                .quantityChange(log.getQuantityChange()).previousStock(log.getPreviousStock())
                .newStock(log.getNewStock()).reason(log.getReason().name())
                .referenceType(log.getReferenceType()).referenceId(log.getReferenceId())
                .notes(log.getNotes())
                .userName(log.getUser() != null ? log.getUser().getFullName() : null)
                .createdAt(log.getCreatedAt()).build();
    }
}
