package com.pos.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaxGroupRequest {

    @NotBlank(message = "Tax group name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 300)
    private String description;

    @Valid
    private List<TaxEntryRequest> taxes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxEntryRequest {

        @NotBlank(message = "Tax name is required")
        @Size(max = 100)
        private String name;

        @NotBlank(message = "Tax type is required")
        private String type;

        @NotNull(message = "Tax rate is required")
        @DecimalMin(value = "0.0", message = "Rate must be non-negative")
        @DecimalMax(value = "100.0", message = "Rate must not exceed 100%")
        private BigDecimal rate;

        @Size(max = 300)
        private String description;

        private Boolean isCompound = false;

        private Integer sortOrder = 0;
    }
}
