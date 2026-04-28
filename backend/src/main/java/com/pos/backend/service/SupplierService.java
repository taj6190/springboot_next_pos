package com.pos.backend.service;

import com.pos.backend.dto.request.SupplierRequest;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.dto.response.SupplierResponse;
import com.pos.backend.entity.Supplier;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public PagedResponse<SupplierResponse> getAllSuppliers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Supplier> supplierPage;
        if (search != null && !search.trim().isEmpty()) {
            supplierPage = supplierRepository.searchSuppliers(search.trim(), pageable);
        } else {
            supplierPage = supplierRepository.findByActiveTrue(pageable);
        }
        return PagedResponse.<SupplierResponse>builder()
                .content(supplierPage.getContent().stream().map(this::mapToResponse).toList())
                .page(supplierPage.getNumber()).size(supplierPage.getSize())
                .totalElements(supplierPage.getTotalElements()).totalPages(supplierPage.getTotalPages())
                .last(supplierPage.isLast()).first(supplierPage.isFirst()).build();
    }

    public SupplierResponse getSupplierById(Long id) {
        return mapToResponse(supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id)));
    }

    @Transactional
    public SupplierResponse createSupplier(SupplierRequest req) {
        Supplier s = Supplier.builder().name(req.getName()).email(req.getEmail()).phone(req.getPhone())
                .address(req.getAddress()).company(req.getCompany()).contactPerson(req.getContactPerson())
                .notes(req.getNotes()).build();
        return mapToResponse(supplierRepository.save(s));
    }

    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest req) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        s.setName(req.getName()); s.setEmail(req.getEmail()); s.setPhone(req.getPhone());
        s.setAddress(req.getAddress()); s.setCompany(req.getCompany());
        s.setContactPerson(req.getContactPerson()); s.setNotes(req.getNotes());
        return mapToResponse(supplierRepository.save(s));
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        s.setActive(false);
        supplierRepository.save(s);
    }

    public SupplierResponse mapToResponse(Supplier s) {
        return SupplierResponse.builder().id(s.getId()).name(s.getName()).email(s.getEmail())
                .phone(s.getPhone()).address(s.getAddress()).company(s.getCompany())
                .contactPerson(s.getContactPerson()).notes(s.getNotes()).active(s.getActive())
                .createdAt(s.getCreatedAt()).build();
    }
}
