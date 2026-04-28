package com.pos.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    private String email;
    private String phone;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    private String company;
    private String contactPerson;
    private String notes;
}
