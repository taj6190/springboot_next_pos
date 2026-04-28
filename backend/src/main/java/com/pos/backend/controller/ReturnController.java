package com.pos.backend.controller;

import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/returns")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnService svc;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<Map<String,Object>>>> getAll(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search, @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(svc.getAll(page, size, search, status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String,Object>>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(svc.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String,Object>>> create(@RequestBody Map<String,Object> req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Return created", svc.create(req)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Map<String,Object>>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Return approved & refunded", svc.approve(id)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Map<String,Object>>> reject(@PathVariable Long id, @RequestBody(required = false) Map<String,String> body) {
        return ResponseEntity.ok(ApiResponse.success("Return rejected", svc.reject(id, body != null ? body.get("reason") : null)));
    }
}
