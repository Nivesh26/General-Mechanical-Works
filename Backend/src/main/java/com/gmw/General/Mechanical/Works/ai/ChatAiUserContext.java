package com.gmw.General.Mechanical.Works.ai;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.appointment.ServiceAppointment;
import com.gmw.General.Mechanical.Works.appointment.ServiceAppointmentRepository;
import com.gmw.General.Mechanical.Works.cart.CartRepository;
import com.gmw.General.Mechanical.Works.order.ShopOrder;
import com.gmw.General.Mechanical.Works.order.ShopOrderRepository;
import com.gmw.General.Mechanical.Works.product.ProductRepository;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;
import com.gmw.General.Mechanical.Works.vehicle.Vehicle;
import com.gmw.General.Mechanical.Works.vehicle.VehicleRepository;

@Component
public class ChatAiUserContext {

	private static final int MAX_RECENT_ORDERS = 5;
	private static final int MAX_RECENT_APPOINTMENTS = 5;

	private final UserRepository userRepository;
	private final VehicleRepository vehicleRepository;
	private final ShopOrderRepository shopOrderRepository;
	private final ServiceAppointmentRepository serviceAppointmentRepository;
	private final CartRepository cartRepository;
	private final ProductRepository productRepository;

	public ChatAiUserContext(
			UserRepository userRepository,
			VehicleRepository vehicleRepository,
			ShopOrderRepository shopOrderRepository,
			ServiceAppointmentRepository serviceAppointmentRepository,
			CartRepository cartRepository,
			ProductRepository productRepository) {
		this.userRepository = userRepository;
		this.vehicleRepository = vehicleRepository;
		this.shopOrderRepository = shopOrderRepository;
		this.serviceAppointmentRepository = serviceAppointmentRepository;
		this.cartRepository = cartRepository;
		this.productRepository = productRepository;
	}

	@Transactional(readOnly = true)
	public String buildUserSection(Long userId) {
		if (userId == null) {
			return "";
		}
		User user = userRepository.findById(userId).orElse(null);
		if (user == null) {
			return "";
		}
		StringBuilder section = new StringBuilder();
		section.append("=== CURRENT CUSTOMER (logged in — use for personalised answers) ===\n");
		section.append("- Name: ").append(user.getName()).append('\n');
		if (StringUtils.hasText(user.getEmail())) {
			section.append("- Email: ").append(user.getEmail()).append('\n');
		}
		if (StringUtils.hasText(user.getPhone())) {
			section.append("- Phone: ").append(user.getPhone()).append('\n');
		}

		List<Vehicle> vehicles = vehicleRepository.findAllByUser_IdOrderByIdAsc(userId);
		if (vehicles.isEmpty()) {
			section.append("- Saved vehicles: none (add at /profilevehicles for faster booking)\n");
		} else {
			section.append("- Saved vehicles:\n");
			for (Vehicle vehicle : vehicles) {
				section.append("  • ")
						.append(vehicle.getCompany())
						.append(' ')
						.append(vehicle.getModel())
						.append(" — ")
						.append(vehicle.getPlate())
						.append(vehicle.isMainBike() ? " (main bike)" : "")
						.append('\n');
			}
		}

		long cartItems = cartRepository.findAllByUser_IdOrderByUpdatedAtDesc(userId).size();
		section.append("- Cart items: ").append(cartItems).append(" (view /cart)\n");

		appendRecentOrders(section, userId);
		appendRecentAppointments(section, userId);
		return section.toString();
	}

	@Transactional(readOnly = true)
	public String buildLiveShopStats() {
		long activeProducts = productRepository.findAllByActiveTrueOrderByCreatedAtDesc().size();
		return "- Active products in shop: " + activeProducts + " (browse /products)\n";
	}

	private void appendRecentOrders(StringBuilder section, Long userId) {
		List<ShopOrder> orders = shopOrderRepository.findByUserIdWithLinesOrderByPlacedAtDesc(userId);
		if (orders.isEmpty()) {
			section.append("- Recent orders: none\n");
			return;
		}
		section.append("- Recent orders:\n");
		orders.stream().limit(MAX_RECENT_ORDERS).forEach(order -> section.append("  • #")
				.append(order.getOrderNumber())
				.append(" — ")
				.append(order.getStatus())
				.append(" — Rs. ")
				.append(order.getTotal().stripTrailingZeros().toPlainString())
				.append(" — ")
				.append(order.getPaymentMethod())
				.append('\n'));
	}

	private void appendRecentAppointments(StringBuilder section, Long userId) {
		List<ServiceAppointment> appointments =
				serviceAppointmentRepository.findByUserIdWithUserOrderByCreatedAtDesc(userId);
		if (appointments.isEmpty()) {
			section.append("- Recent service bookings: none\n");
			return;
		}
		section.append("- Recent service bookings:\n");
		appointments.stream().limit(MAX_RECENT_APPOINTMENTS).forEach(appointment -> section.append("  • ")
				.append(appointment.getServiceTitles())
				.append(" — ")
				.append(appointment.getAppointmentDate())
				.append(' ')
				.append(appointment.getTimeSlot())
				.append(" — ")
				.append(appointment.getStatus())
				.append(" (")
				.append(appointment.getMode())
				.append(")\n"));
	}
}
