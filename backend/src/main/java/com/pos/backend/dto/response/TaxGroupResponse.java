package com.pos.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxGroupResponse {

    private Long id;
    private String name;
    private String description;
    private List<TaxEntryResponse> taxes;
    private BigDecimal totalRate;
    private Boolean active;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxEntryResponse {
        private Long id;
        private String name;
        private String type;
        private BigDecimal rate;
        private String description;
        private Boolean isCompound;
        private Integer sortOrder;
        private Boolean active;
    }
}
