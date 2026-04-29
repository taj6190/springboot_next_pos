package com.pos.backend.controller;

import com.pos.backend.dto.request.StoreRequest;
import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.dto.response.StoreResponse;
import com.pos.backend.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<StoreResponse>>> getAllStores(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(storeService.getAllStores(page, size, search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StoreResponse>> getStoreById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(storeService.getStoreById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StoreResponse>> createStore(
            @Valid @RequestBody StoreRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Store created", storeService.createStore(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StoreResponse>> updateStore(
            @PathVariable Long id, @Valid @RequestBody StoreRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Store updated", storeService.updateStore(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStore(@PathVariable Long id) {
        storeService.deleteStore(id);
        return ResponseEntity.ok(ApiResponse.success("Store deactivated"));
    }
}
