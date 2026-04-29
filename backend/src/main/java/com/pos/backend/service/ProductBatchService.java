package com.pos.backend.service;

import com.pos.backend.dto.request.ProductBatchRequest;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.dto.response.ProductBatchResponse;
import com.pos.backend.entity.Product;
import com.pos.backend.entity.ProductBatch;
import com.pos.backend.entity.ProductVariant;
import com.pos.backend.entity.Supplier;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.ProductBatchRepository;
import com.pos.backend.repository.ProductRepository;
import com.pos.backend.repository.ProductVariantRepository;
import com.pos.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service for managing product batches/lots with expiry tracking.
 * Essential for Bangladesh regulatory compliance where expired goods
 * can lead to fines or shop closures.
 */
@Service
@RequiredArgsConstructor
public class ProductBatchService {

    private final ProductBatchRepository batchRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final SupplierRepository supplierRepository;

    public PagedResponse<ProductBatchResponse> getBatchesByProduct(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("expiryDate").ascending());
        Page<ProductBatch> batchPage = batchRepository.findByProductId(productId, pageable);
        return PagedResponse.<ProductBatchResponse>builder()
                .content(batchPage.getContent().stream().map(this::mapToResponse).toList())
                .page(batchPage.getNumber()).size(batchPage.getSize())
                .totalElements(batchPage.getTotalElements()).totalPages(batchPage.getTotalPages())
                .last(batchPage.isLast()).first(batchPage.isFirst()).build();
    }

    public ProductBatchResponse getBatchById(Long id) {
        return mapToResponse(batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "id", id)));
    }

    /** Returns all batches expiring within the given number of days. */
    public List<ProductBatchResponse> getExpiringBatches(int days) {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(days);
        return batchRepository.findExpiringBetween(start, end).stream()
                .map(this::mapToResponse)
                .toList();
    }

    /** Returns all already-expired batches. */
    public List<ProductBatchResponse> getExpiredBatches() {
        return batchRepository.findExpiredBatches(LocalDate.now()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ProductBatchResponse createBatch(ProductBatchRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        ProductBatch batch = ProductBatch.builder()
                .product(product)
                .batchNumber(request.getBatchNumber())
                .manufactureDate(request.getManufactureDate())
                .expiryDate(request.getExpiryDate())
                .receivedQuantity(request.getReceivedQuantity())
                .availableQuantity(request.getReceivedQuantity())
                .costPrice(request.getCostPrice())
                .notes(request.getNotes())
                .build();

        if (request.getVariantId() != null) {
            ProductVariant variant = variantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.getVariantId()));
            batch.setVariant(variant);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
            batch.setSupplier(supplier);
        }

        return mapToResponse(batchRepository.save(batch));
    }

    @Transactional
    public ProductBatchResponse updateBatch(Long id, ProductBatchRequest request) {
        ProductBatch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "id", id));

        batch.setBatchNumber(request.getBatchNumber());
        batch.setManufactureDate(request.getManufactureDate());
        batch.setExpiryDate(request.getExpiryDate());
        if (request.getCostPrice() != null) batch.setCostPrice(request.getCostPrice());
        batch.setNotes(request.getNotes());

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
            batch.setSupplier(supplier);
        }
        return mapToResponse(batchRepository.save(batch));
    }

    @Transactional
    public void deleteBatch(Long id) {
        ProductBatch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "id", id));
        batch.setActive(false);
        batchRepository.save(batch);
    }

    private ProductBatchResponse mapToResponse(ProductBatch b) {
        return ProductBatchResponse.builder()
                .id(b.getId())
                .productId(b.getProduct().getId())
                .productName(b.getProduct().getName())
                .variantId(b.getVariant() != null ? b.getVariant().getId() : null)
                .variantName(b.getVariant() != null ? b.getVariant().getVariantName() : null)
                .batchNumber(b.getBatchNumber())
                .manufactureDate(b.getManufactureDate())
                .expiryDate(b.getExpiryDate())
                .receivedQuantity(b.getReceivedQuantity())
                .availableQuantity(b.getAvailableQuantity())
                .costPrice(b.getCostPrice())
                .supplierId(b.getSupplier() != null ? b.getSupplier().getId() : null)
                .supplierName(b.getSupplier() != null ? b.getSupplier().getName() : null)
                .notes(b.getNotes())
                .expired(b.isExpired())
                .active(b.getActive())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
