import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { HiOutlineMapPin } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import {
  createPickupAppointment,
  fetchMyVehicles,
  fetchServiceAvailability,
  type ApiVehicleDto,
  type ServiceAvailabilityDay,
} from "../lib/api";
import { workshopServices } from "./serviceBookingShared";

/** Google Maps iframe: official Embed API when key is set, otherwise classic lat/lng embed. */
function buildGoogleMapsEmbedSrc(lat: number, lng: number): string {
  const key = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY?.trim();
  if (key) {
    const params = new URLSearchParams({
      key,
      center: `${lat},${lng}`,
      zoom: "16",
    });
    return `https://www.google.com/maps/embed/v1/view?${params.toString()}`;
  }
  const q = `${lat},${lng}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=16&hl=en&output=embed`;
}

function formatBikeLabel(vehicle: ApiVehicleDto): string {
  const name = `${vehicle.company} ${vehicle.model}`.trim();
  return name ? `${name} — ${vehicle.plate}` : vehicle.plate;
}

const ServicePickupPanel = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [selectedBikeId, setSelectedBikeId] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicles, setVehicles] = useState<ApiVehicleDto[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [availability, setAvailability] = useState<ServiceAvailabilityDay[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied" | "error">("idle");
  const [geoMessage, setGeoMessage] = useState("");

  const mapSrc = useMemo(
    () => (coords ? buildGoogleMapsEmbedSrc(coords.lat, coords.lng) : null),
    [coords]
  );

  const loadAvailability = useCallback(async (silent = false) => {
    if (!silent) setAvailabilityLoading(true);
    try {
      const data = await fetchServiceAvailability();
      setAvailability(data);
    } catch {
      setAvailability([]);
    } finally {
      if (!silent) setAvailabilityLoading(false);
    }
  }, []);

  const availableDates = useMemo(
    () => availability.map((row) => row.date).sort((a, b) => a.localeCompare(b)),
    [availability],
  );

  const slotsForSelectedDate = useMemo(() => {
    return availability.find((row) => row.date === date)?.slots ?? [];
  }, [availability, date]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    const onFocus = () => {
      void loadAvailability(true);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadAvailability]);

  useEffect(() => {
    if (date) {
      void loadAvailability(true);
    }
  }, [date, loadAvailability]);

  useEffect(() => {
    if (!token) {
      setVehicles([]);
      setSelectedBikeId("");
      return;
    }
    let cancelled = false;
    const load = async () => {
      setVehiclesLoading(true);
      try {
        const list = await fetchMyVehicles(token);
        if (cancelled) return;
        setVehicles(list);
        const main = list.find((v) => v.isMainBike) ?? list[0];
        setSelectedBikeId(main ? String(main.id) : "");
      } catch {
        if (!cancelled) {
          setVehicles([]);
          setSelectedBikeId("");
        }
      } finally {
        if (!cancelled) setVehiclesLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (date && !availableDates.includes(date)) {
      setDate("");
      setSlot("");
    }
  }, [availableDates, date]);

  useEffect(() => {
    if (slot && !slotsForSelectedDate.includes(slot)) {
      setSlot("");
    }
  }, [slot, slotsForSelectedDate]);

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      setGeoMessage("Location is not supported in this browser.");
      return;
    }
    setGeoStatus("loading");
    setGeoMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setGeoStatus("ok");
        setGeoMessage("Location captured. Our team will use this point for pickup.");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatus("denied");
          setGeoMessage("Location permission denied. Allow location or try again.");
        } else {
          setGeoStatus("error");
          setGeoMessage("Could not read your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const canSubmit = Boolean(
    selectedServiceIds.length >= 1 &&
      selectedServiceIds.length <= 3 &&
      date &&
      slot &&
      coords &&
      (!token || selectedBikeId) &&
      !submitting,
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.info("Please sign in to book pickup service.");
      navigate("/login");
      return;
    }
    if (!selectedBikeId) {
      toast.info("Select a bike before booking.");
      return;
    }
    if (!coords) {
      toast.info("Share your current location before booking pickup.");
      return;
    }
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await createPickupAppointment(token, {
        serviceIds: selectedServiceIds,
        date,
        timeSlot: slot,
        vehicleId: Number(selectedBikeId),
        pickupLat: coords.lat,
        pickupLng: coords.lng,
        notes: notes.trim() || undefined,
      });
      toast.success("Pickup service booked. We will confirm your appointment soon.");
      setSelectedServiceIds([]);
      setDate("");
      setSlot("");
      setNotes("");
      setCoords(null);
      setGeoStatus("idle");
      setGeoMessage("");
      await loadAvailability(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not book pickup appointment");
      await loadAvailability(true);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, serviceId];
    });
  };

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50/60 p-6 sm:p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pickup service</h2>
        <p className="mt-2 text-sm text-gray-600 max-w-2xl">
          We collect your bike from you. Choose your service and time, then share your real-time pickup location.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">1. Choose service</h3>
        <p className="text-xs text-gray-600 mb-3">Select at least 1 service and up to 3 services.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {workshopServices.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleService(s.id)}
              className={`rounded-xl p-4 border-2 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                selectedServiceIds.includes(s.id)
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <s.Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">{s.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{s.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-sm font-semibold text-gray-900">2. Date & time</h3>
        {availabilityLoading ? (
          <p className="text-sm text-gray-500">Loading available dates…</p>
        ) : availableDates.length === 0 ? (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            No pickup slots are open right now. Please check back soon or book a workshop visit.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="pickup-date" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred date
              </label>
              <select
                id="pickup-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white"
              >
                <option value="" disabled>
                  Select a date
                </option>
                {availableDates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">Available time slots</span>
              {!date ? (
                <p className="text-sm text-gray-500">Choose a date to see open slots.</p>
              ) : slotsForSelectedDate.length === 0 ? (
                <p className="text-sm text-gray-500">No slots left for this date.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slotsForSelectedDate.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSlot(slot === t ? "" : t)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                        slot === t
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">3. Pickup location</h3>
          <p className="text-sm text-gray-600 mb-3">
            Share your current location so our team knows where to collect your bike.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={geoStatus === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-95 transition-opacity disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              <HiOutlineMapPin className="w-5 h-5 shrink-0" aria-hidden />
              {geoStatus === "loading" ? "Getting location…" : "Use my current location"}
            </button>
            {coords && (
              <p className="text-xs text-gray-500 tabular-nums">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            )}
          </div>
          {geoMessage && (
            <p
              className={`text-sm mb-3 ${
                geoStatus === "ok"
                  ? "text-emerald-700"
                  : geoStatus === "denied" || geoStatus === "error"
                    ? "text-amber-800"
                    : "text-gray-600"
              }`}
              role="status"
            >
              {geoMessage}
            </p>
          )}
          <p className="text-sm font-medium text-gray-700 mb-2">Map preview</p>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-200 w-full h-[400px] sm:h-[480px]">
            {mapSrc ? (
              <iframe
                title="Your pickup location on Google Maps"
                className="w-full h-full border-0 block"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                src={mapSrc}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center text-gray-500 text-sm">
                <HiOutlineMapPin className="w-10 h-10 text-gray-400" aria-hidden />
                <span>Map appears here after you share your current location.</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">4. Select bike</h3>
          <label htmlFor="pickup-bike" className="block text-sm text-gray-600 mb-1">
            Choose which bike this booking is for.
          </label>
          {!token ? (
            <p className="text-sm text-gray-600">Sign in to choose from your saved bikes.</p>
          ) : vehiclesLoading ? (
            <p className="text-sm text-gray-500">Loading your bikes…</p>
          ) : vehicles.length === 0 ? (
            <p className="text-sm text-amber-800">
              Add a bike in your profile before booking pickup service.
            </p>
          ) : (
            <select
              id="pickup-bike"
              value={selectedBikeId}
              onChange={(e) => setSelectedBikeId(e.target.value)}
              required
              className="w-full max-w-md border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white"
            >
              <option value="" disabled>
                Select a bike
              </option>
              {vehicles.map((b) => (
                <option key={b.id} value={b.id}>
                  {formatBikeLabel(b)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="pickup-notes" className="block text-sm font-semibold text-gray-900 mb-1">
            5. Notes (optional)
          </label>
          <textarea
            id="pickup-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Landmark, gate code, or specific issues…"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-y bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-semibold hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? "Booking…" : "Book pickup service"}
        </button>
      </form>
    </section>
  );
};

export default ServicePickupPanel;
