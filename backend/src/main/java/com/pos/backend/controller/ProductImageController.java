package com.pos.backend.controller;

import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.ProductImageResponse;
import com.pos.backend.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/product-images")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageService imageService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductImageResponse>>> getImagesByProduct(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(imageService.getImagesByProduct(productId)));
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<ProductImageResponse>> uploadImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "") String altText,
            @RequestParam(required = false, defaultValue = "false") boolean isPrimary) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image uploaded",
                        imageService.uploadImage(productId, file, altText, isPrimary)));
    }

    @PatchMapping("/{imageId}/primary")
    public ResponseEntity<ApiResponse<ProductImageResponse>> setPrimary(
            @PathVariable Long imageId) {
        return ResponseEntity.ok(ApiResponse.success("Primary image set",
                imageService.setPrimary(imageId)));
    }

    @PatchMapping("/{imageId}/sort-order")
    public ResponseEntity<ApiResponse<ProductImageResponse>> updateSortOrder(
            @PathVariable Long imageId, @RequestParam int sortOrder) {
        return ResponseEntity.ok(ApiResponse.success("Sort order updated",
                imageService.updateSortOrder(imageId, sortOrder)));
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long imageId) {
        imageService.deleteImage(imageId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted"));
    }
}
