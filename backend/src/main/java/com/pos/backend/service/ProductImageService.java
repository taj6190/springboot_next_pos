package com.pos.backend.service;

import com.pos.backend.dto.response.ProductImageResponse;
import com.pos.backend.entity.Product;
import com.pos.backend.entity.ProductImage;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.ProductImageRepository;
import com.pos.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Service for managing product image galleries via Cloudinary.
 * Supports multiple images per product with sort ordering and primary image selection.
 */
@Service
@RequiredArgsConstructor
public class ProductImageService {

    private final ProductImageRepository imageRepository;
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    public List<ProductImageResponse> getImagesByProduct(Long productId) {
        return imageRepository.findByProductIdOrderBySortOrderAsc(productId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ProductImageResponse uploadImage(Long productId, MultipartFile file,
                                             String altText, boolean isPrimary) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Map<String, String> uploadResult = cloudinaryService.uploadImage(file, "products");

        // If this is set as primary, unset any existing primary
        if (isPrimary) {
            imageRepository.findByProductIdAndIsPrimaryTrue(productId)
                    .ifPresent(existing -> {
                        existing.setIsPrimary(false);
                        imageRepository.save(existing);
                    });
        }

        int nextOrder = (int) imageRepository.countByProductId(productId);

        ProductImage image = ProductImage.builder()
                .product(product)
                .url(uploadResult.get("url"))
                .publicId(uploadResult.get("publicId"))
                .altText(altText)
                .sortOrder(nextOrder)
                .isPrimary(isPrimary)
                .build();

        // Also update legacy single-image field on Product if this is the primary
        if (isPrimary) {
            product.setImageUrl(uploadResult.get("url"));
            product.setImagePublicId(uploadResult.get("publicId"));
            productRepository.save(product);
        }

        return mapToResponse(imageRepository.save(image));
    }

    @Transactional
    public ProductImageResponse setPrimary(Long imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));

        // Unset current primary
        imageRepository.findByProductIdAndIsPrimaryTrue(image.getProduct().getId())
                .ifPresent(existing -> {
                    existing.setIsPrimary(false);
                    imageRepository.save(existing);
                });

        image.setIsPrimary(true);
        image = imageRepository.save(image);

        // Sync legacy field
        Product product = image.getProduct();
        product.setImageUrl(image.getUrl());
        product.setImagePublicId(image.getPublicId());
        productRepository.save(product);

        return mapToResponse(image);
    }

    @Transactional
    public ProductImageResponse updateSortOrder(Long imageId, int sortOrder) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));
        image.setSortOrder(sortOrder);
        return mapToResponse(imageRepository.save(image));
    }

    @Transactional
    public void deleteImage(Long imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));

        // Delete from Cloudinary
        cloudinaryService.deleteImage(image.getPublicId());

        // If this was the primary image, clear the legacy field
        if (Boolean.TRUE.equals(image.getIsPrimary())) {
            Product product = image.getProduct();
            product.setImageUrl(null);
            product.setImagePublicId(null);
            productRepository.save(product);
        }

        imageRepository.delete(image);
    }

    private ProductImageResponse mapToResponse(ProductImage img) {
        return ProductImageResponse.builder()
                .id(img.getId())
                .productId(img.getProduct().getId())
                .url(img.getUrl())
                .publicId(img.getPublicId())
                .altText(img.getAltText())
                .sortOrder(img.getSortOrder())
                .isPrimary(img.getIsPrimary())
                .build();
    }
}
