package com.gmw.General.Mechanical.Works.ai;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Offline fallback when Ollama image generation is unavailable.
 * Applies a smooth luminance-preserving paint tint (no speckles).
 */
@Component
class BikeColorPreviewRenderer {

	private static final Logger log = LoggerFactory.getLogger(BikeColorPreviewRenderer.class);
	private static final int BLUR_RADIUS = 4;

	private static final Map<String, Color> COLOR_MAP = Map.ofEntries(
			Map.entry("red", new Color(196, 18, 42)),
			Map.entry("maroon", new Color(120, 8, 28)),
			Map.entry("blue", new Color(24, 78, 188)),
			Map.entry("dark blue", new Color(10, 36, 100)),
			Map.entry("navy", new Color(0, 24, 78)),
			Map.entry("light blue", new Color(70, 150, 220)),
			Map.entry("green", new Color(18, 130, 62)),
			Map.entry("lime", new Color(176, 242, 18)),
			Map.entry("lime green", new Color(160, 230, 20)),
			Map.entry("neon green", new Color(57, 255, 20)),
			Map.entry("fluorescent green", new Color(57, 255, 20)),
			Map.entry("yellow", new Color(220, 175, 18)),
			Map.entry("orange", new Color(220, 100, 18)),
			Map.entry("pink", new Color(220, 80, 140)),
			Map.entry("purple", new Color(110, 40, 160)),
			Map.entry("brown", new Color(100, 62, 36)),
			Map.entry("beige", new Color(200, 180, 140)),
			Map.entry("gold", new Color(190, 150, 36)),
			Map.entry("bronze", new Color(150, 100, 44)),
			Map.entry("silver", new Color(168, 172, 178)),
			Map.entry("metallic silver", new Color(164, 168, 176)),
			Map.entry("grey", new Color(110, 110, 116)),
			Map.entry("gray", new Color(110, 110, 116)),
			Map.entry("black", new Color(22, 22, 26)),
			Map.entry("matte black", new Color(28, 28, 30)),
			Map.entry("gloss black", new Color(10, 10, 12)),
			Map.entry("white", new Color(242, 242, 246)));

	Optional<byte[]> recolorFromBase64(String sourceImageBase64, String targetColorName) {
		if (!StringUtils.hasText(sourceImageBase64) || !StringUtils.hasText(targetColorName)) {
			return Optional.empty();
		}
		try {
			byte[] raw = Base64.getDecoder().decode(sourceImageBase64);
			BufferedImage source = ImageIO.read(new ByteArrayInputStream(raw));
			if (source == null) {
				return Optional.empty();
			}
			BufferedImage out = recolor(toRgb(source), resolveColor(targetColorName));
			byte[] bytes = writeJpeg(out, 0.92f);
			if (bytes.length == 0) {
				return Optional.empty();
			}
			return Optional.of(bytes);
		} catch (Exception ex) {
			log.warn("Local bike recolor failed: {}", ex.getMessage());
			return Optional.empty();
		}
	}

	private static Color resolveColor(String name) {
		String key = name.trim().toLowerCase(Locale.ROOT);
		Color mapped = COLOR_MAP.get(key);
		if (mapped != null) {
			return mapped;
		}
		for (Map.Entry<String, Color> entry : COLOR_MAP.entrySet()) {
			if (key.contains(entry.getKey())) {
				return entry.getValue();
			}
		}
		return new Color(196, 18, 42);
	}

	private static BufferedImage toRgb(BufferedImage image) {
		if (image.getType() == BufferedImage.TYPE_INT_RGB) {
			return image;
		}
		BufferedImage rgb = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB);
		rgb.createGraphics().drawImage(image, 0, 0, Color.WHITE, null);
		return rgb;
	}

	private static BufferedImage recolor(BufferedImage source, Color target) {
		int width = source.getWidth();
		int height = source.getHeight();
		float[] weights = new float[width * height];

		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++) {
				int pixel = source.getRGB(x, y);
				int r = (pixel >> 16) & 0xff;
				int g = (pixel >> 8) & 0xff;
				int b = pixel & 0xff;
				weights[y * width + x] = paintWeight(r, g, b);
			}
		}

		weights = boxBlur(weights, width, height, BLUR_RADIUS);

		float tr = target.getRed() / 255f;
		float tg = target.getGreen() / 255f;
		float tb = target.getBlue() / 255f;
		float targetLum = luminance(tr, tg, tb);

		BufferedImage out = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++) {
				int pixel = source.getRGB(x, y);
				int r = (pixel >> 16) & 0xff;
				int g = (pixel >> 8) & 0xff;
				int b = pixel & 0xff;
				float w = clamp01(weights[y * width + x]);
				if (w < 0.02f) {
					out.setRGB(x, y, pixel | 0xff000000);
					continue;
				}

				float rf = r / 255f;
				float gf = g / 255f;
				float bf = b / 255f;
				float lum = luminance(rf, gf, bf);

				// Keep the photo's shading; tint with the requested paint color.
				float scale = lum / Math.max(targetLum, 0.12f);
				// Slight lift so very dark body panels still show the new color.
				float lifted = clamp01(scale * 0.88f + 0.10f);
				float cr = clamp01(tr * lifted);
				float cg = clamp01(tg * lifted);
				float cb = clamp01(tb * lifted);

				// Soft blend — avoids harsh speckles on reflections.
				float blend = w * 0.92f;
				int nr = Math.round((rf * (1f - blend) + cr * blend) * 255f);
				int ng = Math.round((gf * (1f - blend) + cg * blend) * 255f);
				int nb = Math.round((bf * (1f - blend) + cb * blend) * 255f);
				out.setRGB(x, y, (0xff << 24) | (clamp255(nr) << 16) | (clamp255(ng) << 8) | clamp255(nb));
			}
		}
		return out;
	}

	/**
	 * High weight on painted body panels; low on white background, chrome, and tires.
	 */
	private static float paintWeight(int r, int g, int b) {
		float rf = r / 255f;
		float gf = g / 255f;
		float bf = b / 255f;
		float avg = (rf + gf + bf) / 3f;
		float max = Math.max(rf, Math.max(gf, bf));
		float min = Math.min(rf, Math.min(gf, bf));
		float sat = max <= 1e-5f ? 0f : (max - min) / max;
		float lum = luminance(rf, gf, bf);

		// Studio / white background
		float bg = smoothstep(0.86f, 0.97f, avg) * (1f - smoothstep(0.04f, 0.14f, sat));
		// Bright chrome / metal
		float chrome = smoothstep(0.52f, 0.72f, lum) * (1f - smoothstep(0.08f, 0.22f, sat));
		// Rubber / deep black shadows (tires, voids)
		float rubber = 1f - smoothstep(0.04f, 0.14f, lum);

		float notBg = 1f - bg;
		float notChrome = 1f - chrome;
		float notRubber = 1f - rubber * 0.85f;

		// Body panels: mid-dark to mid tones on the bike silhouette.
		float bodyTone = smoothstep(0.06f, 0.18f, lum) * (1f - smoothstep(0.62f, 0.82f, lum));
		// Prefer areas that already look painted, but still cover dark fairings.
		float painted = Math.max(smoothstep(0.06f, 0.22f, sat), bodyTone);

		return clamp01(notBg * notChrome * notRubber * painted);
	}

	private static float[] boxBlur(float[] src, int width, int height, int radius) {
		if (radius <= 0) {
			return src;
		}
		float[] temp = new float[src.length];
		float[] dest = new float[src.length];

		// Horizontal
		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++) {
				float sum = 0f;
				int count = 0;
				for (int dx = -radius; dx <= radius; dx++) {
					int xx = Math.min(width - 1, Math.max(0, x + dx));
					sum += src[y * width + xx];
					count++;
				}
				temp[y * width + x] = sum / count;
			}
		}
		// Vertical
		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++) {
				float sum = 0f;
				int count = 0;
				for (int dy = -radius; dy <= radius; dy++) {
					int yy = Math.min(height - 1, Math.max(0, y + dy));
					sum += temp[yy * width + x];
					count++;
				}
				dest[y * width + x] = sum / count;
			}
		}
		return dest;
	}

	private static float luminance(float r, float g, float b) {
		return 0.2126f * r + 0.7152f * g + 0.0722f * b;
	}

	private static float smoothstep(float edge0, float edge1, float x) {
		float t = clamp01((x - edge0) / (edge1 - edge0));
		return t * t * (3f - 2f * t);
	}

	private static float clamp01(float value) {
		return Math.max(0f, Math.min(1f, value));
	}

	private static int clamp255(int value) {
		return Math.max(0, Math.min(255, value));
	}

	private static byte[] writeJpeg(BufferedImage image, float quality) throws Exception {
		Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
		if (!writers.hasNext()) {
			ByteArrayOutputStream fallback = new ByteArrayOutputStream();
			ImageIO.write(image, "jpg", fallback);
			return fallback.toByteArray();
		}
		ImageWriter writer = writers.next();
		ImageWriteParam params = writer.getDefaultWriteParam();
		if (params.canWriteCompressed()) {
			params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
			params.setCompressionQuality(quality);
		}
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		try (ImageOutputStream stream = ImageIO.createImageOutputStream(output)) {
			writer.setOutput(stream);
			writer.write(null, new IIOImage(image, null, null), params);
		} finally {
			writer.dispose();
		}
		return output.toByteArray();
	}
}
