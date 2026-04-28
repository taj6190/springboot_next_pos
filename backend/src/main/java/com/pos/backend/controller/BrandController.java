package com.pos.backend.controller;

import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService svc;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String,Object>>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(svc.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String,Object>>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(svc.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String,Object>>> create(@RequestBody Map<String,Object> req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Brand created", svc.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String,Object>>> update(@PathVariable Long id, @RequestBody Map<String,Object> req) {
        return ResponseEntity.ok(ApiResponse.success("Brand updated", svc.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        svc.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deactivated"));
    }
}
