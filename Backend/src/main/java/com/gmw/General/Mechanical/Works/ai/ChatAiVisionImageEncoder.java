package com.gmw.General.Mechanical.Works.ai;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Iterator;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

final class ChatAiVisionImageEncoder {

	private static final int MAX_SIDE_PX = 1024;

	private ChatAiVisionImageEncoder() {
	}

	static String toVisionBase64(byte[] rawBytes) {
		if (rawBytes == null || rawBytes.length == 0) {
			throw new IllegalArgumentException("Image bytes are required");
		}
		try {
			BufferedImage image = ImageIO.read(new ByteArrayInputStream(rawBytes));
			if (image == null) {
				return Base64.getEncoder().encodeToString(rawBytes);
			}
			BufferedImage scaled = scaleDown(toRgb(image), MAX_SIDE_PX);
			return Base64.getEncoder().encodeToString(writeJpeg(scaled, 0.85f));
		} catch (Exception ex) {
			return Base64.getEncoder().encodeToString(rawBytes);
		}
	}

	private static BufferedImage toRgb(BufferedImage image) {
		if (image.getType() == BufferedImage.TYPE_INT_RGB) {
			return image;
		}
		BufferedImage rgb = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB);
		Graphics2D graphics = rgb.createGraphics();
		graphics.setColor(Color.WHITE);
		graphics.fillRect(0, 0, image.getWidth(), image.getHeight());
		graphics.drawImage(image, 0, 0, null);
		graphics.dispose();
		return rgb;
	}

	private static BufferedImage scaleDown(BufferedImage image, int maxSide) {
		int width = image.getWidth();
		int height = image.getHeight();
		int longest = Math.max(width, height);
		if (longest <= maxSide) {
			return image;
		}
		double scale = (double) maxSide / longest;
		int targetWidth = Math.max(1, (int) Math.round(width * scale));
		int targetHeight = Math.max(1, (int) Math.round(height * scale));
		Image scaled = image.getScaledInstance(targetWidth, targetHeight, Image.SCALE_SMOOTH);
		BufferedImage output = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
		Graphics2D graphics = output.createGraphics();
		graphics.drawImage(scaled, 0, 0, null);
		graphics.dispose();
		return output;
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
