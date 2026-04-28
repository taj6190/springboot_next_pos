package com.pos.backend.service;

import com.pos.backend.dto.request.ProductRequest;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.dto.response.ProductResponse;
import com.pos.backend.entity.Brand;
import com.pos.backend.entity.Category;
import com.pos.backend.entity.Product;
import com.pos.backend.exception.DuplicateResourceException;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.BrandRepository;
import com.pos.backend.repository.CategoryRepository;
import com.pos.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final CloudinaryService cloudinaryService;

    public PagedResponse<ProductResponse> getAllProducts(int page, int size, String search, Long categoryId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage;
        if (search != null && !search.trim().isEmpty()) {
            productPage = productRepository.searchProducts(search.trim(), pageable);
        } else if (categoryId != null) {
            productPage = productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
        } else {
            productPage = productRepository.findAllActive(pageable);
        }
        return PagedResponse.<ProductResponse>builder()
                .content(productPage.getContent().stream().map(this::mapToResponse).toList())
                .page(productPage.getNumber()).size(productPage.getSize())
                .totalElements(productPage.getTotalElements()).totalPages(productPage.getTotalPages())
                .last(productPage.isLast()).first(productPage.isFirst()).build();
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToResponse(product);
    }

    public ProductResponse getProductByBarcode(String barcode) {
        Product product = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "barcode", barcode));
        return mapToResponse(product);
    }

    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        String sku = generateSku();
        if (request.getBarcode() != null && !request.getBarcode().isEmpty()
                && productRepository.existsByBarcode(request.getBarcode())) {
            throw new DuplicateResourceException("Product", "barcode", request.getBarcode());
        }

        Product product = Product.builder()
                .name(request.getName()).sku(sku).barcode(request.getBarcode())
                .description(request.getDescription()).costPrice(request.getCostPrice())
                .sellingPrice(request.getSellingPrice())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .minStock(request.getMinStock() != null ? request.getMinStock() : 5)
                .unit(request.getUnit()).taxRate(request.getTaxRate()).active(true).build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", request.getBrandId()));
            product.setBrand(brand);
        }
        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.getBarcode() != null && !request.getBarcode().isEmpty()
                && !request.getBarcode().equals(product.getBarcode())
                && productRepository.existsByBarcode(request.getBarcode())) {
            throw new DuplicateResourceException("Product", "barcode", request.getBarcode());
        }

        product.setName(request.getName());
        product.setBarcode(request.getBarcode());
        product.setDescription(request.getDescription());
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        if (request.getMinStock() != null) product.setMinStock(request.getMinStock());
        product.setUnit(request.getUnit());
        if (request.getTaxRate() != null) product.setTaxRate(request.getTaxRate());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", request.getBrandId()));
            product.setBrand(brand);
        } else {
            product.setBrand(null);
        }
        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse uploadProductImage(Long id, MultipartFile file) throws IOException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        if (product.getImagePublicId() != null) {
            cloudinaryService.deleteImage(product.getImagePublicId());
        }
        Map<String, String> uploadResult = cloudinaryService.uploadImage(file, "products");
        product.setImageUrl(uploadResult.get("url"));
        product.setImagePublicId(uploadResult.get("publicId"));
        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setActive(false);
        productRepository.save(product);
    }

    private String generateSku() {
        String sku;
        do {
            sku = "PRD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (productRepository.existsBySku(sku));
        return sku;
    }

    public ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId()).name(product.getName()).sku(product.getSku())
                .barcode(product.getBarcode()).description(product.getDescription())
                .costPrice(product.getCostPrice()).sellingPrice(product.getSellingPrice())
                .stock(product.getStock()).minStock(product.getMinStock())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .unit(product.getUnit())
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .weight(product.getWeight()).weightUnit(product.getWeightUnit())
                .soldByWeight(product.getSoldByWeight()).expiryTracking(product.getExpiryTracking())
                .taxRate(product.getTaxRate()).active(product.getActive())
                .lowStock(product.getStock() <= product.getMinStock())
                .createdAt(product.getCreatedAt()).updatedAt(product.getUpdatedAt()).build();
    }
}
