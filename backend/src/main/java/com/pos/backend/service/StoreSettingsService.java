package com.pos.backend.service;

import com.pos.backend.entity.StoreSettings;
import com.pos.backend.repository.StoreSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StoreSettingsService {

    private final StoreSettingsRepository repo;

    public StoreSettings get() {
        return repo.findAll().stream().findFirst()
                .orElseGet(() -> repo.save(StoreSettings.builder().build()));
    }

    @Transactional
    public StoreSettings update(Map<String,Object> req) {
        StoreSettings s = get();
        if (req.containsKey("storeName")) s.setStoreName((String) req.get("storeName"));
        if (req.containsKey("tagline")) s.setTagline((String) req.get("tagline"));
        if (req.containsKey("address")) s.setAddress((String) req.get("address"));
        if (req.containsKey("phone")) s.setPhone((String) req.get("phone"));
        if (req.containsKey("email")) s.setEmail((String) req.get("email"));
        if (req.containsKey("website")) s.setWebsite((String) req.get("website"));
        if (req.containsKey("defaultTaxRate")) s.setDefaultTaxRate(Double.parseDouble(req.get("defaultTaxRate").toString()));
        if (req.containsKey("currency")) s.setCurrency((String) req.get("currency"));
        if (req.containsKey("currencySymbol")) s.setCurrencySymbol((String) req.get("currencySymbol"));
        if (req.containsKey("receiptFooter")) s.setReceiptFooter((String) req.get("receiptFooter"));
        if (req.containsKey("returnPolicy")) s.setReturnPolicy((String) req.get("returnPolicy"));
        if (req.containsKey("lowStockThreshold")) s.setLowStockThreshold(Integer.parseInt(req.get("lowStockThreshold").toString()));
        return repo.save(s);
    }
}
