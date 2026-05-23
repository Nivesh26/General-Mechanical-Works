package com.gmw.General.Mechanical.Works.offer;

final class OfferMapper {

	private OfferMapper() {
	}

	static OfferDto toDto(Offer offer) {
		return new OfferDto(offer.getId(), offer.getDescription(), offer.getImagePath());
	}
}
