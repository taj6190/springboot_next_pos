package com.pos.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductBatchRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    private Long variantId;

    @NotBlank(message = "Batch number is required")
    @Size(max = 50)
    private String batchNumber;

    private LocalDate manufactureDate;

    private LocalDate expiryDate;

    @NotNull(message = "Received quantity is required")
    @Min(value = 1, message = "Received quantity must be at least 1")
    private Integer receivedQuantity;

    @DecimalMin(value = "0.0", message = "Cost price must be non-negative")
    private BigDecimal costPrice;

    private Long supplierId;

    @Size(max = 500)
    private String notes;
}
