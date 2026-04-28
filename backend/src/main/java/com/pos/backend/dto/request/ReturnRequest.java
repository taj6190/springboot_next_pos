package com.pos.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequest {

    @NotNull(message = "Return items are required")
    private List<ReturnItemRequest> items;

    private String reason;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnItemRequest {

        @NotNull(message = "Order item ID is required")
        private Long orderItemId;

        @NotNull(message = "Return quantity is required")
        @Min(value = 1, message = "Return quantity must be at least 1")
        private Integer quantity;
    }
}
