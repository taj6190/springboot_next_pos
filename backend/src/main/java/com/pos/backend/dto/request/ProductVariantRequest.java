package com.pos.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Variant name is required")
    @Size(max = 200)
    private String variantName;

    private String barcode;

    @Size(max = 50)
    private String option1Name;

    @Size(max = 100)
    private String option1Value;

    @Size(max = 50)
    private String option2Name;

    @Size(max = 100)
    private String option2Value;

    @DecimalMin(value = "0.0", message = "Cost price must be non-negative")
    private BigDecimal costPrice;

    @DecimalMin(value = "0.01", message = "Selling price must be greater than 0")
    private BigDecimal sellingPrice;

    @DecimalMin(value = "0.0")
    private BigDecimal mrp;

    private BigDecimal weight;
    private String weightUnit;
}
