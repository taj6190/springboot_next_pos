package com.pos.backend.service;

import com.pos.backend.entity.Expense;
import com.pos.backend.enums.ExpenseCategory;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.ExpenseRepository;
import com.pos.backend.dto.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository repo;

    public PagedResponse<Map<String,Object>> getAll(int page, int size, String search) {
        Pageable p = PageRequest.of(page, size, Sort.by("expenseDate").descending());
        Page<Expense> pg = (search != null && !search.isEmpty()) ? repo.search(search, p) : repo.findAll(p);
        return PagedResponse.<Map<String,Object>>builder()
                .content(pg.getContent().stream().map(this::toMap).toList())
                .page(pg.getNumber()).size(pg.getSize())
                .totalElements(pg.getTotalElements()).totalPages(pg.getTotalPages())
                .last(pg.isLast()).first(pg.isFirst()).build();
    }

    public Map<String,Object> getById(Long id) {
        return toMap(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Expense","id",id)));
    }

    @Transactional
    public Map<String,Object> create(Map<String,Object> req) {
        Expense e = Expense.builder()
                .title((String) req.get("title"))
                .description((String) req.get("description"))
                .amount(new BigDecimal(req.get("amount").toString()))
                .category(ExpenseCategory.valueOf(((String) req.get("category")).toUpperCase()))
                .expenseDate(req.get("expenseDate") != null ? LocalDate.parse((String) req.get("expenseDate")) : LocalDate.now())
                .vendor((String) req.get("vendor"))
                .approvedBy((String) req.get("approvedBy"))
                .build();
        return toMap(repo.save(e));
    }

    @Transactional
    public Map<String,Object> update(Long id, Map<String,Object> req) {
        Expense e = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Expense","id",id));
        e.setTitle((String) req.get("title"));
        e.setDescription((String) req.get("description"));
        e.setAmount(new BigDecimal(req.get("amount").toString()));
        e.setCategory(ExpenseCategory.valueOf(((String) req.get("category")).toUpperCase()));
        if (req.get("expenseDate") != null) e.setExpenseDate(LocalDate.parse((String) req.get("expenseDate")));
        e.setVendor((String) req.get("vendor"));
        e.setApprovedBy((String) req.get("approvedBy"));
        return toMap(repo.save(e));
    }

    @Transactional
    public void delete(Long id) { repo.deleteById(id); }

    public Map<String,Object> getSummary() {
        LocalDate today = LocalDate.now();
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("todayExpenses", repo.sumExpensesBetween(today, today));
        m.put("weekExpenses", repo.sumExpensesBetween(today.minusDays(7), today));
        m.put("monthExpenses", repo.sumExpensesBetween(today.withDayOfMonth(1), today));
        m.put("totalExpenses", repo.sumTotalExpenses());
        return m;
    }

    private Map<String,Object> toMap(Expense e) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", e.getId()); m.put("title", e.getTitle()); m.put("description", e.getDescription());
        m.put("amount", e.getAmount()); m.put("category", e.getCategory().name());
        m.put("expenseDate", e.getExpenseDate()); m.put("vendor", e.getVendor());
        m.put("approvedBy", e.getApprovedBy()); m.put("createdAt", e.getCreatedAt());
        return m;
    }
}
