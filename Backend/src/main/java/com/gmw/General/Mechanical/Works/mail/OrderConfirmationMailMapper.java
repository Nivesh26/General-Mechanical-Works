package com.gmw.General.Mechanical.Works.mail;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.order.OrderLine;
import com.gmw.General.Mechanical.Works.order.PaymentMethod;
import com.gmw.General.Mechanical.Works.order.ShopOrder;
import com.gmw.General.Mechanical.Works.payment.AppUrlProperties;

@Component
public class OrderConfirmationMailMapper {

	private final AppUrlProperties appUrlProperties;

	public OrderConfirmationMailMapper(AppUrlProperties appUrlProperties) {
		this.appUrlProperties = appUrlProperties;
	}

	public OrderConfirmationView toView(ShopOrder order) {
		List<OrderLineView> lines = order.getLines().stream()
				.filter(line -> !line.isCancelled())
				.map(this::toLineView)
				.toList();

		return new OrderConfirmationView(
				order.getOrderNumber(),
				order.getCustomerName(),
				order.getCustomerEmail(),
				displayValue(order.getPhone(), "—"),
				order.getAddress(),
				paymentMethodLabel(order.getPaymentMethod()),
				formatRs(order.getSubtotal()),
				formatRs(order.getTaxAmount()),
				formatRs(order.getTotal()),
				lines);
	}

	private OrderLineView toLineView(OrderLine line) {
		BigDecimal lineTotal = line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity()));
		return new OrderLineView(
				line.getProductName(),
				line.getSku(),
				line.getQuantity(),
				displaySize(line.getSizeLabel()),
				formatRs(line.getUnitPrice()),
				formatRs(lineTotal),
				resolveImageUrl(line.getImagePath()));
	}

	private static String paymentMethodLabel(PaymentMethod method) {
		return switch (method) {
			case COD -> "Cash on Delivery (COD)";
			case ESEWA -> "eSewa";
			case KHALTI -> "Khalti";
		};
	}

	private static String displaySize(String sizeLabel) {
		return StringUtils.hasText(sizeLabel) ? sizeLabel.trim() : "—";
	}

	private static String displayValue(String value, String fallback) {
		return StringUtils.hasText(value) ? value.trim() : fallback;
	}

	private String resolveImageUrl(String imagePath) {
		if (!StringUtils.hasText(imagePath)) {
			return null;
		}
		if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
			return imagePath;
		}
		String base = trimTrailingSlash(appUrlProperties.getBackendPublicUrl());
		return base + (imagePath.startsWith("/") ? imagePath : "/" + imagePath);
	}

	private static String formatRs(BigDecimal amount) {
		BigDecimal rounded = amount.setScale(0, RoundingMode.HALF_UP);
		NumberFormat formatter = NumberFormat.getNumberInstance(Locale.forLanguageTag("en-IN"));
		return "Rs. " + formatter.format(rounded);
	}

	private static String trimTrailingSlash(String url) {
		if (url == null || url.isBlank()) {
			return "http://localhost:8080";
		}
		return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
	}

	public record OrderLineView(
			String productName,
			String sku,
			int quantity,
			String sizeLabel,
			String unitPrice,
			String lineTotal,
			String imageUrl) {
	}

	public record OrderConfirmationView(
			String orderNumber,
			String customerName,
			String customerEmail,
			String phone,
			String address,
			String paymentMethodLabel,
			String subtotal,
			String taxAmount,
			String total,
			List<OrderLineView> lines) {
	}
}
