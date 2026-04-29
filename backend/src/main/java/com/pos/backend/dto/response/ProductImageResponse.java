package com.pos.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageResponse {

    private Long id;
    private Long productId;
    private String url;
    private String publicId;
    private String altText;
    private Integer sortOrder;
    private Boolean isPrimary;
}
