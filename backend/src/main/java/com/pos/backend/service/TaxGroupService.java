package com.pos.backend.service;

import com.pos.backend.dto.request.TaxGroupRequest;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.dto.response.TaxGroupResponse;
import com.pos.backend.entity.Tax;
import com.pos.backend.entity.TaxGroup;
import com.pos.backend.enums.TaxType;
import com.pos.backend.exception.BadRequestException;
import com.pos.backend.exception.DuplicateResourceException;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.TaxGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service for managing tax groups and their tax entries.
 * Supports Bangladesh VAT (15%) and supplementary duty configurations.
 */
@Service
@RequiredArgsConstructor
public class TaxGroupService {

    private final TaxGroupRepository taxGroupRepository;

    public PagedResponse<TaxGroupResponse> getAllTaxGroups(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<TaxGroup> groupPage = taxGroupRepository.findByActiveTrue(pageable);
        return PagedResponse.<TaxGroupResponse>builder()
                .content(groupPage.getContent().stream().map(this::mapToResponse).toList())
                .page(groupPage.getNumber()).size(groupPage.getSize())
                .totalElements(groupPage.getTotalElements()).totalPages(groupPage.getTotalPages())
                .last(groupPage.isLast()).first(groupPage.isFirst()).build();
    }

    public TaxGroupResponse getTaxGroupById(Long id) {
        return mapToResponse(taxGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TaxGroup", "id", id)));
    }

    @Transactional
    public TaxGroupResponse createTaxGroup(TaxGroupRequest request) {
        if (taxGroupRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("TaxGroup", "name", request.getName());
        }

        TaxGroup group = TaxGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        if (request.getTaxes() != null) {
            for (TaxGroupRequest.TaxEntryRequest taxReq : request.getTaxes()) {
                Tax tax = buildTaxEntry(taxReq);
                group.addTax(tax);
            }
        }
        return mapToResponse(taxGroupRepository.save(group));
    }

    @Transactional
    public TaxGroupResponse updateTaxGroup(Long id, TaxGroupRequest request) {
        TaxGroup group = taxGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TaxGroup", "id", id));

        if (!group.getName().equals(request.getName())
                && taxGroupRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("TaxGroup", "name", request.getName());
        }

        group.setName(request.getName());
        group.setDescription(request.getDescription());

        // Replace all tax entries
        group.getTaxes().clear();
        if (request.getTaxes() != null) {
            for (TaxGroupRequest.TaxEntryRequest taxReq : request.getTaxes()) {
                Tax tax = buildTaxEntry(taxReq);
                group.addTax(tax);
            }
        }
        return mapToResponse(taxGroupRepository.save(group));
    }

    @Transactional
    public void deleteTaxGroup(Long id) {
        TaxGroup group = taxGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TaxGroup", "id", id));
        group.setActive(false);
        taxGroupRepository.save(group);
    }

    /**
     * Calculates the total tax amount for a given subtotal using this tax group.
     * Handles compound taxes correctly — compound taxes are applied on
     * (subtotal + previously computed tax amounts).
     */
    public BigDecimal calculateTax(Long taxGroupId, BigDecimal subtotal) {
        TaxGroup group = taxGroupRepository.findById(taxGroupId)
                .orElseThrow(() -> new ResourceNotFoundException("TaxGroup", "id", taxGroupId));

        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal runningBase = subtotal;

        List<Tax> activeTaxes = group.getTaxes().stream()
                .filter(Tax::getActive)
                .toList();

        for (Tax tax : activeTaxes) {
            BigDecimal base = tax.getIsCompound() ? runningBase : subtotal;
            BigDecimal taxAmount = base.multiply(tax.getRate())
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            totalTax = totalTax.add(taxAmount);
            runningBase = runningBase.add(taxAmount);
        }
        return totalTax;
    }

    private Tax buildTaxEntry(TaxGroupRequest.TaxEntryRequest req) {
        TaxType type;
        try {
            type = TaxType.valueOf(req.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid tax type: " + req.getType());
        }
        return Tax.builder()
                .name(req.getName())
                .type(type)
                .rate(req.getRate())
                .description(req.getDescription())
                .isCompound(req.getIsCompound() != null ? req.getIsCompound() : false)
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
                .build();
    }

    private TaxGroupResponse mapToResponse(TaxGroup group) {
        List<TaxGroupResponse.TaxEntryResponse> taxEntries = group.getTaxes().stream()
                .map(t -> TaxGroupResponse.TaxEntryResponse.builder()
                        .id(t.getId()).name(t.getName()).type(t.getType().name())
                        .rate(t.getRate()).description(t.getDescription())
                        .isCompound(t.getIsCompound()).sortOrder(t.getSortOrder())
                        .active(t.getActive()).build())
                .toList();

        BigDecimal totalRate = group.getTaxes().stream()
                .filter(Tax::getActive)
                .map(Tax::getRate)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return TaxGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .taxes(taxEntries)
                .totalRate(totalRate)
                .active(group.getActive())
                .createdAt(group.getCreatedAt())
                .build();
    }
}
