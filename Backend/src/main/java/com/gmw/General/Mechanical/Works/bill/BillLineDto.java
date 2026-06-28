package com.gmw.General.Mechanical.Works.bill;

public record BillLineDto(String id, String description, int quantity, double unitPrice) {
}
