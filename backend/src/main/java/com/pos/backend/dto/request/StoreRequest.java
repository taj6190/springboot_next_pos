package com.pos.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreRequest {

    @NotBlank(message = "Store name is required")
    @Size(max = 150)
    private String name;

    @NotBlank(message = "Store code is required")
    @Size(max = 30)
    private String code;

    @Size(max = 500)
    private String address;

    @Size(max = 20)
    private String phone;

    @Size(max = 100)
    private String email;

    private Long managerId;
}
