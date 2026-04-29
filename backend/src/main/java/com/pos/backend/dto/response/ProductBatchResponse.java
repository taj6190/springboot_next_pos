package com.pos.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductBatchResponse {

    private Long id;
    private Long productId;
    private String productName;
    private Long variantId;
    private String variantName;
    private String batchNumber;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private Integer receivedQuantity;
    private Integer availableQuantity;
    private BigDecimal costPrice;
    private Long supplierId;
    private String supplierName;
    private String notes;
    private Boolean expired;
    private Boolean active;
    private LocalDateTime createdAt;
}
