package com.pos.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSupplierResponse {

    private Long id;
    private Long productId;
    private String productName;
    private Long supplierId;
    private String supplierName;
    private BigDecimal purchasePrice;
    private Integer leadTimeDays;
    private Integer minOrderQuantity;
    private Boolean preferred;
    private String supplierSku;
    private String notes;
    private LocalDateTime createdAt;
}
