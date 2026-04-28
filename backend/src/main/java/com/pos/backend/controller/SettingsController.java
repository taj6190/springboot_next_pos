package com.pos.backend.controller;

import com.pos.backend.dto.response.ApiResponse;
import com.pos.backend.entity.StoreSettings;
import com.pos.backend.service.StoreSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final StoreSettingsService svc;

    @GetMapping
    public ResponseEntity<ApiResponse<StoreSettings>> get() {
        return ResponseEntity.ok(ApiResponse.success(svc.get()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<StoreSettings>> update(@RequestBody Map<String,Object> req) {
        return ResponseEntity.ok(ApiResponse.success("Settings updated", svc.update(req)));
    }
}
