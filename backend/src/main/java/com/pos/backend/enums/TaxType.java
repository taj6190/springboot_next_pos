package com.pos.backend.enums;

/**
 * Types of tax applicable under Bangladesh tax regulations.
 * VAT is the standard 15% rate; supplementary duty applies to luxury/cosmetics items.
 */
public enum TaxType {
    VAT,
    SUPPLEMENTARY_DUTY,
    CUSTOMS_DUTY,
    OTHER
}
