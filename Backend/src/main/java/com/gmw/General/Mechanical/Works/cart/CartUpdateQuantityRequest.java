package com.gmw.General.Mechanical.Works.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CartUpdateQuantityRequest(@NotNull @Min(1) Integer quantity) {
}
