package com.pos.backend.service;

import com.pos.backend.dto.request.ProductVariantRequest;
import com.pos.backend.dto.response.ProductVariantResponse;
import com.pos.backend.entity.Product;
import com.pos.backend.entity.ProductVariant;
import com.pos.backend.exception.DuplicateResourceException;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.ProductRepository;
import com.pos.backend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing product variants.
 * Enables variant-aware catalogue — e.g., "Lipstick" with 20 shades × 2 sizes.
 */
@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;

    public List<ProductVariantResponse> getVariantsByProduct(Long productId) {
        return variantRepository.findByProductIdAndActiveTrue(productId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProductVariantResponse getVariantById(Long id) {
        return mapToResponse(variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id)));
    }

    public ProductVariantResponse getVariantByBarcode(String barcode) {
        return mapToResponse(variantRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "barcode", barcode)));
    }

    @Transactional
    public ProductVariantResponse createVariant(ProductVariantRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (request.getBarcode() != null && !request.getBarcode().isEmpty()
                && variantRepository.existsByBarcode(request.getBarcode())) {
            throw new DuplicateResourceException("ProductVariant", "barcode", request.getBarcode());
        }

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(generateVariantSku(product.getSku()))
                .barcode(request.getBarcode())
                .variantName(request.getVariantName())
                .option1Name(request.getOption1Name())
                .option1Value(request.getOption1Value())
                .option2Name(request.getOption2Name())
                .option2Value(request.getOption2Value())
                .costPrice(request.getCostPrice() != null ? request.getCostPrice() : product.getCostPrice())
                .sellingPrice(request.getSellingPrice() != null ? request.getSellingPrice() : product.getSellingPrice())
                .mrp(request.getMrp())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .weight(request.getWeight())
                .weightUnit(request.getWeightUnit())
                .build();

        return mapToResponse(variantRepository.save(variant));
    }

    @Transactional
    public ProductVariantResponse updateVariant(Long id, ProductVariantRequest request) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));

        if (request.getBarcode() != null && !request.getBarcode().isEmpty()
                && !request.getBarcode().equals(variant.getBarcode())
                && variantRepository.existsByBarcode(request.getBarcode())) {
            throw new DuplicateResourceException("ProductVariant", "barcode", request.getBarcode());
        }

        variant.setVariantName(request.getVariantName());
        variant.setBarcode(request.getBarcode());
        variant.setOption1Name(request.getOption1Name());
        variant.setOption1Value(request.getOption1Value());
        variant.setOption2Name(request.getOption2Name());
        variant.setOption2Value(request.getOption2Value());
        if (request.getCostPrice() != null) variant.setCostPrice(request.getCostPrice());
        if (request.getSellingPrice() != null) variant.setSellingPrice(request.getSellingPrice());
        variant.setMrp(request.getMrp());
        if (request.getStock() != null) variant.setStock(request.getStock());
        variant.setWeight(request.getWeight());
        variant.setWeightUnit(request.getWeightUnit());

        return mapToResponse(variantRepository.save(variant));
    }

    @Transactional
    public void deleteVariant(Long id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));
        variant.setActive(false);
        variantRepository.save(variant);
    }

    private String generateVariantSku(String productSku) {
        String sku;
        do {
            sku = productSku + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        } while (variantRepository.existsBySku(sku));
        return sku;
    }

    private ProductVariantResponse mapToResponse(ProductVariant v) {
        return ProductVariantResponse.builder()
                .id(v.getId())
                .productId(v.getProduct().getId())
                .productName(v.getProduct().getName())
                .sku(v.getSku())
                .barcode(v.getBarcode())
                .variantName(v.getVariantName())
                .option1Name(v.getOption1Name())
                .option1Value(v.getOption1Value())
                .option2Name(v.getOption2Name())
                .option2Value(v.getOption2Value())
                .costPrice(v.getCostPrice())
                .sellingPrice(v.getSellingPrice())
                .mrp(v.getMrp())
                .stock(v.getStock() != null ? v.getStock() : 0)
                .weight(v.getWeight())
                .weightUnit(v.getWeightUnit())
                .imageUrl(v.getImageUrl())
                .active(v.getActive())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }
}
