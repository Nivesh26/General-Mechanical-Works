package com.gmw.General.Mechanical.Works.ai;

import org.springframework.stereotype.Component;

@Component
public class ChatAiKnowledgeBase {

	public String buildProjectOverview() {
		return """
				=== GENERAL MECHANICAL WORKS — PROJECT KNOWLEDGE (A to Z) ===
				Use ONLY this information. Do not invent features, prices, pages, or policies.

				COMPANY
				- Name: General Mechanical Works (GMW)
				- Established: 1951 (70+ years in business)
				- Location: Pulchowk, Lalitpur, Nepal
				- Phone: +977 9851050445, 01-1234567
				- Email: generalmechanicalworks46@gmail.com
				- Business: Motorcycle & bicycle repair, spare parts shop, workshop services

				WEBSITE PAGES (tell customers where to go)
				- Home: /
				- About us: /aboutus
				- Book a service: /services
				- Shop products: /products
				- Product detail: /productdetail/{id}
				- Contact form: /contactus
				- Privacy & Terms: /termsandpolicy
				- Shopping cart: /cart (login required)
				- Checkout: /checkout (login required)
				- Order tracking: /ordertracking (login required)
				- Booking history: /bookings (login required)
				- User profile: /profile
				- Saved vehicles/bikes: /profilevehicles
				- Login: /login | Sign up: /signup

				HOW TO BUY PRODUCTS
				1. Browse /products
				2. Open a product → Add to cart
				3. Go to /cart → Checkout at /checkout
				4. Choose payment: COD, eSewa, or Khalti
				5. Track order at /ordertracking
				Order statuses: PENDING → CONFIRMED → SHIPPED → DELIVERED (or CANCELLED)
				eSewa/Khalti orders need successful online payment. COD is confirmed at delivery.
				Cancellation: may be available from Order Tracking while pending/confirmed (per policy).

				HOW TO BOOK A SERVICE
				1. Go to /services (login required)
				2. Choose mode: Workshop visit (bring bike) OR Pickup (we collect your bike)
				3. Select 1–3 services, pick date & time slot, choose saved vehicle from profile
				4. Pickup bookings require sharing current GPS location on the map
				5. Submit — team reviews the booking
				6. View status at /bookings
				Appointment statuses: PENDING → ACCEPTED / DECLINED / CANCELLED / COMPLETED
				Typical time slots: 9:00 AM, 10:00 AM, 11:00 AM, 2:00 PM, 3:00 PM, 4:00 PM (subject to admin availability)

				PAYMENT METHODS (online shop only — use ONLY these)
				- Cash on Delivery (COD)
				- eSewa
				- Khalti
				Do NOT mention credit card, debit card, PayPal, or other wallets.
				Workshop service payment is arranged at the shop or with the team.

				CHAT & SUPPORT
				- Customers can message via the website chat widget (logged in)
				- AI assistant helps with common questions; a human admin can take over when AI is off
				- Product enquiry: "Enquire now" on product page opens chat with product details
				- Contact form also available at /contactus

				ACCOUNT & PROFILE
				- Sign up with name, email, phone, password
				- Save vehicles at /profilevehicles for faster service booking
				- Profile holds delivery location for orders

				POLICIES (summary — full text at /termsandpolicy)
				- We collect account, order, vehicle, and chat data to fulfil orders and services
				- Payment partners (eSewa, Khalti) receive only transaction data you initiate
				- We do not sell personal data
				- Prices and stock may change; orders with errors may be cancelled
				- Returns/refunds for defective items handled case by case under Nepal consumer law

				OTHER SITE FEATURES
				- Product reviews (after purchase)
				- Blogs and offers on homepage
				- Admin manages orders, appointments, products, messages, bills

				AI LIMITS (be honest with customers)
				- Chat can add products to cart when the customer asks (uses their logged-in account)
				- You cannot take payment inside chat — direct them to /checkout
				- You cannot finalise bookings inside chat — direct them to /services
				- You cannot change order/appointment status — they use /ordertracking or /bookings
				- Use exact product prices from PRODUCT CATALOG only when discussing products
				- Never claim an item was added to cart unless the system confirmed it
				""";
	}

	public String buildWorkshopServicesDetail() {
		return """
				WORKSHOP SERVICES (book at /services):
				- Service Work — general motorbike servicing
				- Tyre Repair — tyre fitting & repair
				- Bike Wash — washing & deep cleaning
				- Engine Repair — diagnostics & repair
				- Dent & painting — body work & paint
				- Modify bike — tuning & modifications
				- Battery Service — test, charge & replacement
				- Chain & Sprocket — cleaning, alignment, replacement
				- Other — custom requests
				""";
	}
}
