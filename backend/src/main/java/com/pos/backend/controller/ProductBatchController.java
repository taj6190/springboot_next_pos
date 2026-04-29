package com.pos.backend.controller;

import com.pos.backend.dto.request.ProductBatchRequest;
import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.dto.response.ProductBatchResponse;
import com.pos.backend.service.ProductBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-batches")
@RequiredArgsConstructor
public class ProductBatchController {

    private final ProductBatchService batchService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<PagedResponse<ProductBatchResponse>>> getBatchesByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                batchService.getBatchesByProduct(productId, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductBatchResponse>> getBatchById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(batchService.getBatchById(id)));
    }

    /** Returns batches expiring within the given number of days. */
    @GetMapping("/expiring")
    public ResponseEntity<ApiResponse<List<ProductBatchResponse>>> getExpiringBatches(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(batchService.getExpiringBatches(days)));
    }

    /** Returns all already-expired batches. */
    @GetMapping("/expired")
    public ResponseEntity<ApiResponse<List<ProductBatchResponse>>> getExpiredBatches() {
        return ResponseEntity.ok(ApiResponse.success(batchService.getExpiredBatches()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductBatchResponse>> createBatch(
            @Valid @RequestBody ProductBatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Batch created", batchService.createBatch(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductBatchResponse>> updateBatch(
            @PathVariable Long id, @Valid @RequestBody ProductBatchRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Batch updated",
                batchService.updateBatch(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(@PathVariable Long id) {
        batchService.deleteBatch(id);
        return ResponseEntity.ok(ApiResponse.success("Batch deactivated"));
    }
}
