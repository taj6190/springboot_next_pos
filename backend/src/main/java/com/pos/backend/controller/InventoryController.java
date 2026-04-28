package com.pos.backend.controller;

import com.pos.backend.dto.request.InventoryAdjustmentRequest;
import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.InventoryLogResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<PagedResponse<InventoryLogResponse>>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllLogs(page, size)));
    }

    @GetMapping("/logs/product/{productId}")
    public ResponseEntity<ApiResponse<PagedResponse<InventoryLogResponse>>> getLogsByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getLogsByProduct(productId, page, size)));
    }

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<InventoryLogResponse>> adjustInventory(
            @Valid @RequestBody InventoryAdjustmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Inventory adjusted", inventoryService.adjustInventory(request)));
    }
}
