package com.pos.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    private String barcode;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Cost price is required")
    @DecimalMin(value = "0.0", message = "Cost price must be non-negative")
    private BigDecimal costPrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.01", message = "Selling price must be greater than 0")
    private BigDecimal sellingPrice;

    /** Maximum Retail Price — widely used in Bangladesh. */
    @DecimalMin(value = "0.0", message = "MRP must be non-negative")
    private BigDecimal mrp;

    @Min(value = 0, message = "Stock must be non-negative")
    private Integer stock = 0;

    @Min(value = 0, message = "Minimum stock must be non-negative")
    private Integer minStock = 5;

    private Long categoryId;

    private Long brandId;

    private String unit;

    @DecimalMin(value = "0.0", message = "Tax rate must be non-negative")
    @DecimalMax(value = "100.0", message = "Tax rate must not exceed 100%")
    private BigDecimal taxRate;

    /** Link to a TaxGroup for compliant multi-tax calculations. */
    private Long taxGroupId;

    /**
     * Harmonised System Code — required for customs valuation,
     * export/import documentation, and regulatory reporting in Bangladesh.
     */
    @Size(max = 20, message = "HS Code must not exceed 20 characters")
    private String hsCode;

    private BigDecimal weight;

    @Size(max = 20)
    private String weightUnit;

    private Boolean soldByWeight;

    private Boolean expiryTracking;
}
