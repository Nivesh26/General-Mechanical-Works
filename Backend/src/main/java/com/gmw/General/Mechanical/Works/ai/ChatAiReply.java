package com.gmw.General.Mechanical.Works.ai;

import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.product.Product;

public record ChatAiReply(String text, String attachmentUrl, String attachmentName) {

	public static ChatAiReply textOnly(String text) {
		return new ChatAiReply(text, null, null);
	}

	public static ChatAiReply withProductImage(String text, Product product) {
		String imageUrl = ChatAiShopContext.primaryImagePath(product);
		if (!StringUtils.hasText(imageUrl)) {
			return textOnly(text);
		}
		return new ChatAiReply(text, imageUrl.trim(), product.getName());
	}
}
