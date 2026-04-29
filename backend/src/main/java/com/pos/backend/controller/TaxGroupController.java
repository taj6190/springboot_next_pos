package com.pos.backend.controller;

import com.pos.backend.dto.request.TaxGroupRequest;
import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.dto.response.PagedResponse;
import com.pos.backend.dto.response.TaxGroupResponse;
import com.pos.backend.service.TaxGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/tax-groups")
@RequiredArgsConstructor
public class TaxGroupController {

    private final TaxGroupService taxGroupService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TaxGroupResponse>>> getAllTaxGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(taxGroupService.getAllTaxGroups(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxGroupResponse>> getTaxGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(taxGroupService.getTaxGroupById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaxGroupResponse>> createTaxGroup(
            @Valid @RequestBody TaxGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tax group created", taxGroupService.createTaxGroup(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxGroupResponse>> updateTaxGroup(
            @PathVariable Long id, @Valid @RequestBody TaxGroupRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tax group updated",
                taxGroupService.updateTaxGroup(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTaxGroup(@PathVariable Long id) {
        taxGroupService.deleteTaxGroup(id);
        return ResponseEntity.ok(ApiResponse.success("Tax group deactivated"));
    }

    /** Calculate tax for a given subtotal using a specific tax group. */
    @GetMapping("/{id}/calculate")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateTax(
            @PathVariable Long id, @RequestParam BigDecimal subtotal) {
        return ResponseEntity.ok(ApiResponse.success(taxGroupService.calculateTax(id, subtotal)));
    }
}
