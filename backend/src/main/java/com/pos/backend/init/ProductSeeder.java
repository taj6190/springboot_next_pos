package com.pos.backend.init;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.pos.backend.entity.Brand;
import com.pos.backend.entity.Category;
import com.pos.backend.entity.Product;
import com.pos.backend.entity.ProductVariant;
import com.pos.backend.entity.TaxGroup;
import com.pos.backend.repository.BrandRepository;
import com.pos.backend.repository.CategoryRepository;
import com.pos.backend.repository.ProductRepository;
import com.pos.backend.repository.ProductVariantRepository;
import com.pos.backend.repository.TaxGroupRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ProductSeeder — Populates the database with cosmetic products, categories, and brands.
 * Order(2) ensures it runs after DataSeeder (Order(1) or default).
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class ProductSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final TaxGroupRepository taxGroupRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (productRepository.count() >= 500) {
            log.info("Products already seeded (500+). Skipping ProductSeeder.");
            return;
        }

        log.info("Starting Product Seeding (Cosmetics)...");


        // 1. Create Brands (15)
        Map<String, Brand> brands = seedBrands();

        // 2. Create Categories & Subcategories (15 Parent Categories)
        Map<String, Category> categories = seedCategories();

        // 3. Get Tax Group (Standard VAT)
        TaxGroup standardVat = taxGroupRepository.findByName("Standard VAT")
                .orElse(taxGroupRepository.findAll().get(0));

        // 4. Create Products (50 mixed)
        seedProducts(brands, categories, standardVat);

        log.info("Product Seeding Completed!");
    }

    private Map<String, Brand> seedBrands() {
        Map<String, Brand> brandMap = new HashMap<>();
        String[] brandNames = {
            "CeraVe", "Cetaphil", "La Roche-Posay", "Neutrogena", "Olay",
            "L'Oreal", "Maybelline", "Revlon", "MAC", "Estee Lauder",
            "Clinique", "Kiehl's", "The Ordinary", "Laneige", "Innisfree"
        };

        for (String name : brandNames) {
            Optional<Brand> existing = brandRepository.findByName(name);
            if (existing.isPresent()) {
                brandMap.put(name, existing.get());
            } else {
                Brand brand = Brand.builder()
                        .name(name)
                        .description("Premium cosmetics and skincare from " + name)
                        .active(true)
                        .build();
                brandMap.put(name, brandRepository.save(brand));
            }
        }
        return brandMap;
    }

    private Map<String, Category> seedCategories() {
        Map<String, Category> categoryMap = new HashMap<>();
        Map<String, String[]> catStructure = new LinkedHashMap<>();
        catStructure.put("Skin Care", new String[]{"Cleansers", "Moisturizers", "Serums", "Masks"});
        catStructure.put("Hair Care", new String[]{"Shampoos", "Conditioners", "Hair Oils"});
        catStructure.put("Makeup", new String[]{"Face", "Eyes", "Lips", "Nails"});
        catStructure.put("Fragrance", new String[]{"Perfumes", "Deodorants"});
        catStructure.put("Bath & Body", new String[]{"Body Wash", "Lotions", "Scrubs"});
        catStructure.put("Men's Grooming", new String[]{"Shaving", "Beard Care"});
        catStructure.put("Tools & Accessories", new String[]{"Makeup Brushes", "Sponges"});
        catStructure.put("Oral Care", new String[]{"Toothpaste", "Mouthwash"});
        catStructure.put("Baby Care", new String[]{"Baby Lotion", "Baby Shampoo"});
        catStructure.put("Natural & Organic", new String[]{"Organic Oils", "Herbal Creams"});
        catStructure.put("Professional Skincare", new String[]{"Chemical Peels", "Derma Rollers"});
        catStructure.put("Wellness", new String[]{"Supplements", "Essential Oils"});
        catStructure.put("K-Beauty", new String[]{"Sheet Masks", "Essences"});
        catStructure.put("Sun Care", new String[]{"Sunscreens", "After Sun"});
        catStructure.put("Travel Size", new String[]{"Mini Kits", "Pocket Perfumes"});

        int order = 1;
        for (Map.Entry<String, String[]> entry : catStructure.entrySet()) {
            String parentName = entry.getKey();
            Category parent = categoryRepository.findByNameAndParentIsNull(parentName)
                    .orElseGet(() -> categoryRepository.save(Category.builder()
                            .name(parentName)
                            .slug(parentName.toLowerCase().replace(" ", "-").replace("&", "and"))
                            .active(true)
                            .sortOrder(1)
                            .build()));
            categoryMap.put(parentName, parent);

            for (String subName : entry.getValue()) {
                Category child = categoryRepository.findByNameAndParent(subName, parent)
                        .orElseGet(() -> categoryRepository.save(Category.builder()
                                .name(subName)
                                .slug(parent.getSlug() + "-" + subName.toLowerCase().replace(" ", "-"))
                                .parent(parent)
                                .active(true)
                                .build()));
                categoryMap.put(parentName + " > " + subName, child);
            }
        }
        return categoryMap;
    }

    private void seedProducts(Map<String, Brand> brands, Map<String, Category> categories, TaxGroup taxGroup) {
        Random random = new Random();
        List<Brand> brandList = new ArrayList<>(brands.values());
        List<Category> categoryList = new ArrayList<>(categories.values());

        String[] cosmeticImages = {
            "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=400",
            "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=400",
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400",
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400",
            "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=400",
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=400",
            "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=400",
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400",
            "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400",
            "https://images.unsplash.com/photo-1591130219388-ae211f6a52f3?q=80&w=400"
        };

        for (int i = 1; i <= 500; i++) {
            String sku = "SKU-" + String.format("%05d", i);
            String imageUrl = cosmeticImages[random.nextInt(cosmeticImages.length)];

            Optional<Product> existing = productRepository.findBySku(sku);
            if (existing.isPresent()) {
                Product p = existing.get();
                if (p.getImageUrl() == null) {
                    p.setImageUrl(imageUrl);
                    productRepository.save(p);
                }
                continue;
            }

            Brand brand = brandList.get(random.nextInt(brandList.size()));
            Category category = categoryList.get(random.nextInt(categoryList.size()));

            boolean hasVariants = i % 4 == 0; // Every 4th product has variants

            Product product = Product.builder()
                    .name(brand.getName() + " " + category.getName() + " " + i)
                    .sku(sku)
                    .barcode("BAR-" + (100000 + i))
                    .description("Premium " + category.getName() + " from " + brand.getName())
                    .costPrice(new BigDecimal(100 + random.nextInt(900)))
                    .sellingPrice(new BigDecimal(1200 + random.nextInt(2000)))
                    .mrp(new BigDecimal(3500))
                    .stock(hasVariants ? 0 : 50 + random.nextInt(100))
                    .minStock(10)
                    .unit("Piece")
                    .brand(brand)
                    .category(category)
                    .taxGroup(taxGroup)
                    .imageUrl(cosmeticImages[random.nextInt(cosmeticImages.length)])
                    .active(true)
                    .build();

            product = productRepository.save(product);

            if (hasVariants) {
                seedVariants(product, random, cosmeticImages);
            }
        }
        log.info("Seeded 500 products");
    }

    private void seedVariants(Product product, Random random, String[] images) {
        String[] sizes = {"50ml", "100ml", "200ml"};
        String[] shades = {"Natural", "Beige", "Ivory", "Sandy"};

        boolean isSize = random.nextBoolean();
        String optionName = isSize ? "Size" : "Shade";
        String[] options = isSize ? sizes : shades;

        for (int j = 0; j < options.length; j++) {
            ProductVariant variant = ProductVariant.builder()
                    .product(product)
                    .variantName(product.getName() + " - " + options[j])
                    .sku(product.getSku() + "-V" + j)
                    .barcode(product.getBarcode() + "V" + j)
                    .option1Name(optionName)
                    .option1Value(options[j])
                    .costPrice(product.getCostPrice().add(new BigDecimal(j * 10)))
                    .sellingPrice(product.getSellingPrice().add(new BigDecimal(j * 20)))
                    .mrp(product.getMrp())
                    .stock(20 + random.nextInt(50)) // Set variant stock to 20-70
                    .imageUrl(images[random.nextInt(images.length)])
                    .active(true)
                    .build();
            variantRepository.save(variant);
        }
    }
}
