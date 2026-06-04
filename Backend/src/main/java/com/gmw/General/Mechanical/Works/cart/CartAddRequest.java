package com.gmw.General.Mechanical.Works.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CartAddRequest(
		@NotNull Long productId,
		@Min(1) Integer quantity,
		@Size(max = 64) String size) {
}
