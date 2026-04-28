package com.pos.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {

    private Long id;
    private String poNumber;
    private SupplierResponse supplier;
    private List<PurchaseOrderItemResponse> items;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime expectedDate;
    private LocalDateTime receivedAt;
    private String notes;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productSku;
        private Integer quantity;
        private Integer receivedQuantity;
        private BigDecimal unitCost;
        private BigDecimal totalCost;
    }
}
