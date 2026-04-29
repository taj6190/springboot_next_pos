package com.pos.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {

    private Long id;
    private Long storeId;
    private String storeName;
    private String storeCode;
    private Long productId;
    private String productName;
    private String productSku;
    private Long variantId;
    private String variantName;
    private Long batchId;
    private String batchNumber;
    private Integer quantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private Integer reorderPoint;
    private Integer minThreshold;
    private Integer maxThreshold;
    private Boolean needsReorder;
    private Boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
