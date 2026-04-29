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
public class ProductResponse {

    private Long id;
    private String name;
    private String sku;
    private String barcode;
    private String description;

    /* ---------- Pricing ---------- */
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal mrp;

    /* ---------- Stock (legacy single-store) ---------- */
    private Integer stock;
    private Integer minStock;

    /* ---------- Media ---------- */
    private String imageUrl;
    private List<ProductImageResponse> images;

    /* ---------- Classification ---------- */
    private Long categoryId;
    private String categoryName;
    private String unit;
    private Long brandId;
    private String brandName;

    /* ---------- Physical ---------- */
    private BigDecimal weight;
    private String weightUnit;
    private Boolean soldByWeight;
    private Boolean expiryTracking;

    /* ---------- Tax ---------- */
    private BigDecimal taxRate;
    private Long taxGroupId;
    private String taxGroupName;

    /* ---------- Regulatory ---------- */
    private String hsCode;

    /* ---------- Status ---------- */
    private Boolean active;
    private boolean lowStock;

    /* ---------- Counts ---------- */
    private Integer variantCount;
    private Integer batchCount;
    private Integer supplierCount;

    /* ---------- Audit ---------- */
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
