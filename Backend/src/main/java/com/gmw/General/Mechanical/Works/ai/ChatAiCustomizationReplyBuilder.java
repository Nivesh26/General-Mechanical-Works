package com.gmw.General.Mechanical.Works.ai;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.payment.AppUrlProperties;
import com.gmw.General.Mechanical.Works.storage.ImageStorageService;

@Component
public class ChatAiCustomizationReplyBuilder {

	private static final Logger log = LoggerFactory.getLogger(ChatAiCustomizationReplyBuilder.class);

	private final AppUrlProperties appUrlProperties;
	private final ChatAiImageLoader imageLoader;
	private final OllamaImageClient ollamaImageClient;
	private final ImageStorageService imageStorageService;

	public ChatAiCustomizationReplyBuilder(
			AppUrlProperties appUrlProperties,
			ChatAiImageLoader imageLoader,
			OllamaImageClient ollamaImageClient,
			ImageStorageService imageStorageService) {
		this.appUrlProperties = appUrlProperties;
		this.imageLoader = imageLoader;
		this.ollamaImageClient = ollamaImageClient;
		this.imageStorageService = imageStorageService;
	}

	public Optional<ChatAiReply> tryBuildReply(String userMessage, String sourceImageUrl) {
		return tryBuildReply(userMessage, sourceImageUrl, false);
	}

	public Optional<ChatAiReply> tryBuildAdminReply(String adminMessage, String sourceImageUrl) {
		return tryBuildReply(adminMessage, sourceImageUrl, true);
	}

	public Optional<ChatAiReply> tryBuildReply(String userMessage, String sourceImageUrl, boolean forAdmin) {
		boolean hasPhoto = StringUtils.hasText(sourceImageUrl);
		String message = StringUtils.hasText(userMessage) ? userMessage.trim() : "";
		boolean isCustomization = ChatAiIntent.isBikeCustomizationQuestion(message)
				|| (hasPhoto && ChatAiColorParser.extractTargetColor(message).isPresent());
		if (!isCustomization) {
			return Optional.empty();
		}
		Optional<String> targetColor = ChatAiColorParser.extractTargetColor(message);
		String servicesUrl = shopBaseUrl() + "/services";
		Optional<String> previewUrl = hasPhoto && targetColor.isPresent()
				? generateColorPreview(sourceImageUrl, targetColor.get())
				: Optional.empty();

		StringBuilder reply = new StringBuilder();
		if (previewUrl.isPresent()) {
			if (forAdmin) {
				reply.append("Here's an AI color preview for a customer quote — bike in ")
						.append(targetColor.get())
						.append(" (illustration only).\n\n");
			} else {
				reply.append("Here's an AI preview of your bike in ")
						.append(targetColor.get())
						.append(" (illustration only — final paint may vary at the workshop).\n\n");
			}
		} else if (hasPhoto) {
			if (forAdmin) {
				reply.append("Photo received. ");
				if (targetColor.isEmpty()) {
					reply.append("Tell me which color to preview (for example: red, matte black, blue).\n\n");
				} else {
					reply.append("I couldn't generate a preview right now — our painters can still quote the job.\n\n");
				}
			} else {
				reply.append("Thanks for sharing the photo of your bike! ");
				if (targetColor.isEmpty()) {
					reply.append("Tell me which color you want (for example: red, matte black, blue) and I can generate a preview.\n\n");
				} else {
					reply.append("I couldn't generate a preview right now, but our painters can still help.\n\n");
				}
			}
		}
		if (forAdmin) {
			if (targetColor.isPresent()) {
				reply.append("Target color for the quote: ").append(targetColor.get()).append(".\n\n");
			}
			reply.append("""
					Customer booking page: %s
					Admin: check Appointments for Dent & painting requests.

					Workshop handles prep, color coats, and clear coat. Share this preview with the customer when quoting."""
					.formatted(servicesUrl));
		} else {
			if (targetColor.isPresent()) {
				reply.append("Yes — we can change your bike's color to ")
						.append(targetColor.get())
						.append(".\n\n");
			} else if (!hasPhoto || previewUrl.isEmpty()) {
				reply.append("Yes — we can help you change your bike's color or give it a fresh professional paint job.\n\n");
			}
			reply.append("""
					Book our Dent & painting service here:
					%s

					How to book:
					1. Open the link above and log in
					2. Choose Workshop visit or Pickup
					3. Select Dent & painting
					4. Pick your vehicle, date, and time slot
					5. Submit — our team will confirm and quote based on your bike and the finish you want
					""".formatted(servicesUrl));

			if (targetColor.isPresent()) {
				reply.append("\nMention ")
						.append(targetColor.get())
						.append(" in the booking notes so our painters know your preferred color.");
			}
			reply.append("""

					Our workshop handles surface prep, primer, color coats, and clear coat for a durable finish.
					For other custom work (not just paint), choose Modify bike on the same page.""");
		}

		if (previewUrl.isPresent()) {
			return Optional.of(ChatAiReply.withGeneratedImage(reply.toString().trim(), previewUrl.get(), targetColor.get()));
		}
		return Optional.of(ChatAiReply.textOnly(reply.toString().trim()));
	}

	private Optional<String> generateColorPreview(String sourceImageUrl, String targetColor) {
		try {
			Optional<String> sourceBase64 = imageLoader.loadBase64(sourceImageUrl);
			if (sourceBase64.isEmpty()) {
				return Optional.empty();
			}
			Optional<byte[]> generated = ollamaImageClient.repaintBikePreview(sourceBase64.get(), targetColor);
			if (generated.isEmpty()) {
				return Optional.empty();
			}
			return Optional.of(imageStorageService.uploadChatImageBytes(generated.get()));
		} catch (Exception ex) {
			log.warn("Could not generate bike color preview: {}", ex.getMessage());
			return Optional.empty();
		}
	}

	private String shopBaseUrl() {
		String base = appUrlProperties.getFrontendUrl();
		if (base == null) {
			base = "http://localhost:5173";
		}
		return base.replaceAll("/+$", "");
	}
}
