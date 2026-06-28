package com.gmw.General.Mechanical.Works.bill;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, Long> {

	List<Bill> findAllByOrderByUpdatedAtDesc();

	Optional<Bill> findByInvoiceNumberIgnoreCase(String invoiceNumber);

	boolean existsByInvoiceNumberIgnoreCase(String invoiceNumber);

	boolean existsByInvoiceNumberIgnoreCaseAndIdNot(String invoiceNumber, Long id);
}
