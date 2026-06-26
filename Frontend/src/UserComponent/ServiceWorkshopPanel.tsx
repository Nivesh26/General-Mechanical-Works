import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { createWorkshopAppointment, fetchMyVehicles, type ApiVehicleDto } from "../lib/api";
import { timeSlots, workshopServices } from "./serviceBookingShared";

function formatBikeLabel(vehicle: ApiVehicleDto): string {
  const name = `${vehicle.company} ${vehicle.model}`.trim();
  return name ? `${name} — ${vehicle.plate}` : vehicle.plate;
}

const ServiceWorkshopPanel = () => {
  const navigate = useNavigate();
  const { token, loading: authLoading } = useAuth();
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [selectedBikeId, setSelectedBikeId] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicles, setVehicles] = useState<ApiVehicleDto[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    const max = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      minDate: today.toISOString().slice(0, 10),
      maxDate: max.toISOString().slice(0, 10),
    };
  }, []);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.info("Please sign in to book a workshop visit.");
      navigate("/login");
      return;
    }
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await createWorkshopAppointment(token, {
        serviceIds: selectedServiceIds,
        date,
        timeSlot: slot,
        vehicleId: Number(selectedBikeId),
        notes: notes.trim() || undefined,
      });
      toast.success("Workshop visit booked. We will confirm your appointment soon.");
      setSelectedServiceIds([]);
      setDate("");
      setSlot("");
      setNotes("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = Boolean(
    token &&
      selectedServiceIds.length >= 1 &&
      selectedServiceIds.length <= 3 &&
      date &&
      slot &&
      selectedBikeId &&
      !submitting,
  );

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, serviceId];
    });
  };

  if (!authLoading && !token) {
    return (
      <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50/60 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900">Workshop visit</h2>
        <p className="mt-2 text-sm text-gray-600 max-w-2xl">
          Sign in to choose services, pick a date and time, and book a visit to our workshop.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex px-8 py-3.5 rounded-xl bg-primary text-white font-semibold hover:opacity-95 transition-opacity"
        >
          Sign in to book
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50/60 p-6 sm:p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Workshop visit</h2>
        <p className="mt-2 text-sm text-gray-600 max-w-2xl">
          Pick the service you need, then choose a date and time slot. Bring your bike to our garage at the scheduled
          time.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="workshop-date" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred date
            </label>
            <input
              id="workshop-date"
              type="date"
              min={minDate}
              max={maxDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white"
            />
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Time slot</span>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((t) => (
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
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">3. Select bike</h3>
          <label htmlFor="workshop-bike" className="block text-sm text-gray-600 mb-1">
            Choose which bike this booking is for.
          </label>
          {vehiclesLoading ? (
            <p className="text-sm text-gray-500">Loading your bikes…</p>
          ) : vehicles.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Add a bike in your{" "}
              <Link to="/profilevehicles" className="font-semibold underline hover:no-underline">
                profile
              </Link>{" "}
              before booking.
            </div>
          ) : (
            <select
              id="workshop-bike"
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
          <label htmlFor="workshop-notes" className="block text-sm font-semibold text-gray-900 mb-1">
            4. Notes (optional)
          </label>
          <textarea
            id="workshop-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any specific issues or requests…"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-y bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-semibold hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
        >
          {submitting ? "Booking…" : "Book workshop visit"}
        </button>
      </form>
    </section>
  );
};

export default ServiceWorkshopPanel;
