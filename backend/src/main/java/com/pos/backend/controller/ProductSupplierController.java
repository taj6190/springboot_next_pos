package com.pos.backend.controller;

import com.pos.backend.dto.request.ProductSupplierRequest;
import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.ProductSupplierResponse;
import com.pos.backend.service.ProductSupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-suppliers")
@RequiredArgsConstructor
public class ProductSupplierController {

    private final ProductSupplierService productSupplierService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductSupplierResponse>>> getSuppliersByProduct(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(
                productSupplierService.getSuppliersByProduct(productId)));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<ApiResponse<List<ProductSupplierResponse>>> getProductsBySupplier(
            @PathVariable Long supplierId) {
        return ResponseEntity.ok(ApiResponse.success(
                productSupplierService.getProductsBySupplier(supplierId)));
    }

    @GetMapping("/product/{productId}/preferred")
    public ResponseEntity<ApiResponse<ProductSupplierResponse>> getPreferredSupplier(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(
                productSupplierService.getPreferredSupplier(productId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductSupplierResponse>> createProductSupplier(
            @Valid @RequestBody ProductSupplierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product-supplier link created",
                        productSupplierService.createProductSupplier(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductSupplierResponse>> updateProductSupplier(
            @PathVariable Long id, @Valid @RequestBody ProductSupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product-supplier updated",
                productSupplierService.updateProductSupplier(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProductSupplier(@PathVariable Long id) {
        productSupplierService.deleteProductSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Product-supplier link removed"));
    }
}
