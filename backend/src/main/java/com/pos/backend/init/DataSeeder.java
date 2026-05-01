package com.pos.backend.init;

import com.pos.backend.entity.*;
import com.pos.backend.enums.TaxType;
import com.pos.backend.enums.UserRole;
import com.pos.backend.repository.StoreRepository;
import com.pos.backend.repository.TaxGroupRepository;
import com.pos.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Seeds the database with essential default data on first startup:
 * - Default admin user
 * - Default store (MAIN)
 * - Bangladesh tax groups (Standard VAT, Cosmetics VAT + SD)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StoreRepository storeRepository;
    private final TaxGroupRepository taxGroupRepository;

    @Override
    public void run(String... args) {
        log.info("Checking database state for seeding...");
        log.info("User count: {}", userRepository.count());
        log.info("Store count: {}", storeRepository.count());
        log.info("TaxGroup count: {}", taxGroupRepository.count());
        
        seedAdminUser();
        seedDefaultStore();
        seedTaxGroups();
    }

    private void seedAdminUser() {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@pos-system.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .role(UserRole.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("=== Default admin user created ===");
            log.info("Username: admin");
            log.info("Password: admin123");
            log.info("=================================");
        }
    }

    private void seedDefaultStore() {
        if (storeRepository.count() == 0) {
            Store store = Store.builder()
                    .name("Main Store")
                    .code("MAIN")
                    .address("123 Main Street, Dhaka")
                    .phone("+880 1700-000000")
                    .build();
            storeRepository.save(store);
            log.info("Default store 'MAIN' created");
        }
    }

    private void seedTaxGroups() {
        if (taxGroupRepository.count() == 0) {
            // Standard VAT (15%)
            TaxGroup standardVat = TaxGroup.builder()
                    .name("Standard VAT")
                    .description("Bangladesh standard VAT rate of 15%")
                    .build();
            standardVat.addTax(Tax.builder()
                    .name("VAT")
                    .type(TaxType.VAT)
                    .rate(new BigDecimal("15.00"))
                    .description("Standard VAT — 15%")
                    .sortOrder(0)
                    .build());
            taxGroupRepository.save(standardVat);

            // Cosmetics — VAT 15% + Supplementary Duty 20%
            TaxGroup cosmeticsTax = TaxGroup.builder()
                    .name("Cosmetics Tax (VAT + SD)")
                    .description("VAT 15% plus 20% Supplementary Duty for cosmetics/luxury items")
                    .build();
            cosmeticsTax.addTax(Tax.builder()
                    .name("VAT")
                    .type(TaxType.VAT)
                    .rate(new BigDecimal("15.00"))
                    .description("Standard VAT — 15%")
                    .sortOrder(0)
                    .build());
            cosmeticsTax.addTax(Tax.builder()
                    .name("Supplementary Duty — Cosmetics")
                    .type(TaxType.SUPPLEMENTARY_DUTY)
                    .rate(new BigDecimal("20.00"))
                    .description("Supplementary duty on cosmetics/luxury items")
                    .sortOrder(1)
                    .build());
            taxGroupRepository.save(cosmeticsTax);

            // VAT Exempt
            TaxGroup vatExempt = TaxGroup.builder()
                    .name("VAT Exempt")
                    .description("No tax — exempt goods (essential commodities)")
                    .build();
            taxGroupRepository.save(vatExempt);

            log.info("Default tax groups created: Standard VAT, Cosmetics Tax, VAT Exempt");
        }
    }
}
