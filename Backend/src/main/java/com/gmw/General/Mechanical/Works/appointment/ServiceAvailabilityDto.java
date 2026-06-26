package com.gmw.General.Mechanical.Works.appointment;

import java.util.List;

public record ServiceAvailabilityDto(String date, List<String> slots) {
}
