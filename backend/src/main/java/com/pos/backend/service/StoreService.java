package com.pos.backend.service;

import com.pos.backend.dto.request.StoreRequest;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.dto.response.StoreResponse;
import com.pos.backend.entity.Store;
import com.pos.backend.entity.User;
import com.pos.backend.exception.DuplicateResourceException;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.StoreRepository;
import com.pos.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    public PagedResponse<StoreResponse> getAllStores(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Store> storePage;
        if (search != null && !search.trim().isEmpty()) {
            storePage = storeRepository.searchStores(search.trim(), pageable);
        } else {
            storePage = storeRepository.findByActiveTrue(pageable);
        }
        return PagedResponse.<StoreResponse>builder()
                .content(storePage.getContent().stream().map(this::mapToResponse).toList())
                .page(storePage.getNumber()).size(storePage.getSize())
                .totalElements(storePage.getTotalElements()).totalPages(storePage.getTotalPages())
                .last(storePage.isLast()).first(storePage.isFirst()).build();
    }

    public StoreResponse getStoreById(Long id) {
        return mapToResponse(storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id)));
    }

    @Transactional
    public StoreResponse createStore(StoreRequest request) {
        if (storeRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Store", "code", request.getCode());
        }
        Store store = Store.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .build();

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getManagerId()));
            store.setManager(manager);
        }
        return mapToResponse(storeRepository.save(store));
    }

    @Transactional
    public StoreResponse updateStore(Long id, StoreRequest request) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));

        if (!store.getCode().equals(request.getCode().toUpperCase())
                && storeRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new DuplicateResourceException("Store", "code", request.getCode());
        }

        store.setName(request.getName());
        store.setCode(request.getCode().toUpperCase());
        store.setAddress(request.getAddress());
        store.setPhone(request.getPhone());
        store.setEmail(request.getEmail());

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getManagerId()));
            store.setManager(manager);
        } else {
            store.setManager(null);
        }
        return mapToResponse(storeRepository.save(store));
    }

    @Transactional
    public void deleteStore(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));
        store.setActive(false);
        storeRepository.save(store);
    }

    private StoreResponse mapToResponse(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .code(store.getCode())
                .address(store.getAddress())
                .phone(store.getPhone())
                .email(store.getEmail())
                .managerId(store.getManager() != null ? store.getManager().getId() : null)
                .managerName(store.getManager() != null ? store.getManager().getFullName() : null)
                .active(store.getActive())
                .createdAt(store.getCreatedAt())
                .updatedAt(store.getUpdatedAt())
                .build();
    }
}
