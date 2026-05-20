package com.gmw.General.Mechanical.Works.vehicle;

import org.springframework.util.StringUtils;

final class VehicleMapper {

	private VehicleMapper() {
	}

	static VehicleDto toDto(Vehicle entity) {
		VehicleDto.EmbossedParts embossed = null;
		if (entity.getPlateFormat() == PlateFormat.EMBOSSED
				&& (StringUtils.hasText(entity.getEmbossedProvince())
						|| StringUtils.hasText(entity.getEmbossedCategory())
						|| StringUtils.hasText(entity.getEmbossedLot())
						|| StringUtils.hasText(entity.getEmbossedDigits()))) {
			embossed = new VehicleDto.EmbossedParts(
					entity.getEmbossedProvince(),
					entity.getEmbossedCategory(),
					entity.getEmbossedLot(),
					entity.getEmbossedDigits());
		}

		VehicleDto.TraditionalParts traditional = null;
		if (entity.getPlateFormat() == PlateFormat.TRADITIONAL
				&& (StringUtils.hasText(entity.getTraditionalZone())
						|| StringUtils.hasText(entity.getTraditionalLot())
						|| StringUtils.hasText(entity.getTraditionalCategory())
						|| StringUtils.hasText(entity.getTraditionalDigits()))) {
			traditional = new VehicleDto.TraditionalParts(
					entity.getTraditionalZone(),
					entity.getTraditionalLot(),
					entity.getTraditionalCategory(),
					entity.getTraditionalDigits());
		}

		return new VehicleDto(
				entity.getId(),
				entity.getCompany(),
				entity.getModel(),
				entity.getPlate(),
				entity.getColor(),
				entity.getPlateFormat(),
				entity.isMainBike(),
				embossed,
				traditional);
	}

	static void applyRequest(Vehicle entity, VehicleRequest request) {
		entity.setCompany(request.company().trim());
		entity.setModel(request.model().trim());
		entity.setPlate(request.plate().trim());
		entity.setColor(StringUtils.hasText(request.color()) ? request.color().trim() : "");
		entity.setPlateFormat(request.plateFormat() != null ? request.plateFormat() : PlateFormat.EMBOSSED);
		clearPlateParts(entity);
		if (entity.getPlateFormat() == PlateFormat.EMBOSSED && request.embossed() != null) {
			VehicleDto.EmbossedParts e = request.embossed();
			entity.setEmbossedProvince(trimOrNull(e.province()));
			entity.setEmbossedCategory(trimOrNull(e.category()));
			entity.setEmbossedLot(trimOrNull(e.lot()));
			entity.setEmbossedDigits(trimOrNull(e.digits()));
		} else if (entity.getPlateFormat() == PlateFormat.TRADITIONAL && request.traditional() != null) {
			VehicleDto.TraditionalParts t = request.traditional();
			entity.setTraditionalZone(trimOrNull(t.zone()));
			entity.setTraditionalLot(trimOrNull(t.lot()));
			entity.setTraditionalCategory(trimOrNull(t.category()));
			entity.setTraditionalDigits(trimOrNull(t.digits()));
		}
	}

	private static void clearPlateParts(Vehicle entity) {
		entity.setEmbossedProvince(null);
		entity.setEmbossedCategory(null);
		entity.setEmbossedLot(null);
		entity.setEmbossedDigits(null);
		entity.setTraditionalZone(null);
		entity.setTraditionalLot(null);
		entity.setTraditionalCategory(null);
		entity.setTraditionalDigits(null);
	}

	private static String trimOrNull(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		return value.trim();
	}
}
