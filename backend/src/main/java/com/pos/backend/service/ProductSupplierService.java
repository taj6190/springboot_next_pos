package com.pos.backend.service;

import com.pos.backend.dto.request.ProductSupplierRequest;
import com.pos.backend.dto.response.ProductSupplierResponse;
import com.pos.backend.entity.Product;
import com.pos.backend.entity.ProductSupplier;
import com.pos.backend.entity.Supplier;
import com.pos.backend.exception.DuplicateResourceException;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.ProductRepository;
import com.pos.backend.repository.ProductSupplierRepository;
import com.pos.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing product-supplier relationships.
 * Tracks purchase prices, lead times, and preferred supplier flags
 * separately from the product master for accurate cost tracking
 * and automated purchase order generation.
 */
@Service
@RequiredArgsConstructor
public class ProductSupplierService {

    private final ProductSupplierRepository productSupplierRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public List<ProductSupplierResponse> getSuppliersByProduct(Long productId) {
        return productSupplierRepository.findByProductId(productId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProductSupplierResponse> getProductsBySupplier(Long supplierId) {
        return productSupplierRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProductSupplierResponse getPreferredSupplier(Long productId) {
        return mapToResponse(productSupplierRepository.findByProductIdAndPreferredTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductSupplier", "productId (preferred)", productId)));
    }

    @Transactional
    public ProductSupplierResponse createProductSupplier(ProductSupplierRequest request) {
        if (productSupplierRepository.existsByProductIdAndSupplierId(
                request.getProductId(), request.getSupplierId())) {
            throw new DuplicateResourceException("ProductSupplier", "product+supplier",
                    request.getProductId() + "+" + request.getSupplierId());
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        // If marking as preferred, unset any existing preferred supplier
        if (Boolean.TRUE.equals(request.getPreferred())) {
            productSupplierRepository.findByProductIdAndPreferredTrue(request.getProductId())
                    .ifPresent(existing -> {
                        existing.setPreferred(false);
                        productSupplierRepository.save(existing);
                    });
        }

        ProductSupplier ps = ProductSupplier.builder()
                .product(product)
                .supplier(supplier)
                .purchasePrice(request.getPurchasePrice())
                .leadTimeDays(request.getLeadTimeDays())
                .minOrderQuantity(request.getMinOrderQuantity() != null ? request.getMinOrderQuantity() : 1)
                .preferred(request.getPreferred() != null ? request.getPreferred() : false)
                .supplierSku(request.getSupplierSku())
                .notes(request.getNotes())
                .build();

        return mapToResponse(productSupplierRepository.save(ps));
    }

    @Transactional
    public ProductSupplierResponse updateProductSupplier(Long id, ProductSupplierRequest request) {
        ProductSupplier ps = productSupplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductSupplier", "id", id));

        if (Boolean.TRUE.equals(request.getPreferred()) && !Boolean.TRUE.equals(ps.getPreferred())) {
            productSupplierRepository.findByProductIdAndPreferredTrue(ps.getProduct().getId())
                    .ifPresent(existing -> {
                        existing.setPreferred(false);
                        productSupplierRepository.save(existing);
                    });
        }

        ps.setPurchasePrice(request.getPurchasePrice());
        ps.setLeadTimeDays(request.getLeadTimeDays());
        if (request.getMinOrderQuantity() != null) ps.setMinOrderQuantity(request.getMinOrderQuantity());
        ps.setPreferred(request.getPreferred() != null ? request.getPreferred() : ps.getPreferred());
        ps.setSupplierSku(request.getSupplierSku());
        ps.setNotes(request.getNotes());

        return mapToResponse(productSupplierRepository.save(ps));
    }

    @Transactional
    public void deleteProductSupplier(Long id) {
        ProductSupplier ps = productSupplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductSupplier", "id", id));
        productSupplierRepository.delete(ps);
    }

    private ProductSupplierResponse mapToResponse(ProductSupplier ps) {
        return ProductSupplierResponse.builder()
                .id(ps.getId())
                .productId(ps.getProduct().getId())
                .productName(ps.getProduct().getName())
                .supplierId(ps.getSupplier().getId())
                .supplierName(ps.getSupplier().getName())
                .purchasePrice(ps.getPurchasePrice())
                .leadTimeDays(ps.getLeadTimeDays())
                .minOrderQuantity(ps.getMinOrderQuantity())
                .preferred(ps.getPreferred())
                .supplierSku(ps.getSupplierSku())
                .notes(ps.getNotes())
                .createdAt(ps.getCreatedAt())
                .build();
    }
}
