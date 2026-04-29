package com.pos.backend.controller;

import com.pos.backend.dto.request.ProductVariantRequest;
import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.ProductVariantResponse;
import com.pos.backend.service.ProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService variantService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductVariantResponse>>> getVariantsByProduct(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(variantService.getVariantsByProduct(productId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> getVariantById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(variantService.getVariantById(id)));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> getVariantByBarcode(
            @PathVariable String barcode) {
        return ResponseEntity.ok(ApiResponse.success(variantService.getVariantByBarcode(barcode)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductVariantResponse>> createVariant(
            @Valid @RequestBody ProductVariantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Variant created", variantService.createVariant(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> updateVariant(
            @PathVariable Long id, @Valid @RequestBody ProductVariantRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Variant updated",
                variantService.updateVariant(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVariant(@PathVariable Long id) {
        variantService.deleteVariant(id);
        return ResponseEntity.ok(ApiResponse.success("Variant deactivated"));
    }
}
