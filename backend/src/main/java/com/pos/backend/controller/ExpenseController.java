package com.pos.backend.controller;

import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService svc;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<Map<String,Object>>>> getAll(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(svc.getAll(page, size, search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String,Object>>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(svc.getById(id)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String,Object>>> summary() {
        return ResponseEntity.ok(ApiResponse.success(svc.getSummary()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String,Object>>> create(@RequestBody Map<String,Object> req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Expense created", svc.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String,Object>>> update(@PathVariable Long id, @RequestBody Map<String,Object> req) {
        return ResponseEntity.ok(ApiResponse.success("Expense updated", svc.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        svc.delete(id); return ResponseEntity.ok(ApiResponse.success("Deleted"));
    }
}
