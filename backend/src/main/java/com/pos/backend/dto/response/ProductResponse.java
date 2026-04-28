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
public class ProductResponse {

    private Long id;
    private String name;
    private String sku;
    private String barcode;
    private String description;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer stock;
    private Integer minStock;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
    private String unit;
    private Long brandId;
    private String brandName;
    private BigDecimal weight;
    private String weightUnit;
    private Boolean soldByWeight;
    private Boolean expiryTracking;
    private BigDecimal taxRate;
    private Boolean active;
    private boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
