package com.pos.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSupplierRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.0", message = "Purchase price must be non-negative")
    private BigDecimal purchasePrice;

    @Min(value = 0, message = "Lead time must be non-negative")
    private Integer leadTimeDays;

    @Min(value = 1, message = "Minimum order quantity must be at least 1")
    private Integer minOrderQuantity = 1;

    private Boolean preferred = false;

    @Size(max = 50)
    private String supplierSku;

    @Size(max = 500)
    private String notes;
}
