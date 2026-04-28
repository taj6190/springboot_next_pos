package com.pos.backend.service;

import com.pos.backend.dto.request.CustomerRequest;
import com.pos.backend.dto.response.CustomerResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.entity.Customer;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public PagedResponse<CustomerResponse> getAllCustomers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Customer> customerPage;
        if (search != null && !search.trim().isEmpty()) {
            customerPage = customerRepository.searchCustomers(search.trim(), pageable);
        } else {
            customerPage = customerRepository.findByActiveTrue(pageable);
        }
        return PagedResponse.<CustomerResponse>builder()
                .content(customerPage.getContent().stream().map(this::mapToResponse).toList())
                .page(customerPage.getNumber()).size(customerPage.getSize())
                .totalElements(customerPage.getTotalElements()).totalPages(customerPage.getTotalPages())
                .last(customerPage.isLast()).first(customerPage.isFirst()).build();
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return mapToResponse(c);
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest req) {
        Customer c = Customer.builder().name(req.getName()).email(req.getEmail())
                .phone(req.getPhone()).address(req.getAddress()).notes(req.getNotes()).build();
        c = customerRepository.save(c);
        return mapToResponse(c);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest req) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        c.setName(req.getName()); c.setEmail(req.getEmail());
        c.setPhone(req.getPhone()); c.setAddress(req.getAddress()); c.setNotes(req.getNotes());
        c = customerRepository.save(c);
        return mapToResponse(c);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        c.setActive(false);
        customerRepository.save(c);
    }

    public CustomerResponse mapToResponse(Customer c) {
        return CustomerResponse.builder().id(c.getId()).name(c.getName()).email(c.getEmail())
                .phone(c.getPhone()).address(c.getAddress()).loyaltyPoints(c.getLoyaltyPoints())
                .totalPurchases(c.getTotalPurchases()).active(c.getActive()).notes(c.getNotes())
                .createdAt(c.getCreatedAt()).build();
    }
}
