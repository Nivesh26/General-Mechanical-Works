import { createPortal } from "react-dom";

export function BookingRedirectOverlay() {
  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-white/75 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-label="Opening your bookings"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white px-8 py-6 shadow-md">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm font-medium text-gray-700">Opening your bookings…</p>
      </div>
    </div>,
    document.body,
  );
}
