package com.pos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Store settings - single row config table.
 */
@Entity
@Table(name = "store_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoreSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_name", length = 200)
    @Builder.Default
    private String storeName = "POS System";

    @Column(length = 200)
    @Builder.Default
    private String tagline = "Your Trusted Supershop";

    @Column(length = 300)
    @Builder.Default
    private String address = "123 Main Street, Dhaka";

    @Column(length = 20)
    @Builder.Default
    private String phone = "+880 1700-000000";

    @Column(length = 100)
    private String email;

    @Column(length = 500)
    private String website;

    @Column(name = "tax_rate", columnDefinition = "DECIMAL(5,2) DEFAULT 0")
    @Builder.Default
    private Double defaultTaxRate = 0.0;

    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "currency_symbol", length = 5)
    @Builder.Default
    private String currencySymbol = "$";

    @Column(name = "receipt_footer", length = 500)
    @Builder.Default
    private String receiptFooter = "Thank you for shopping!";

    @Column(name = "return_policy", length = 500)
    @Builder.Default
    private String returnPolicy = "Exchange/Return within 7 days with receipt";

    @Column(name = "low_stock_threshold")
    @Builder.Default
    private Integer lowStockThreshold = 10;
}
