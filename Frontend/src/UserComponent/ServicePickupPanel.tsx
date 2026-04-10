import { useCallback, useMemo, useState } from "react";
import { HiOutlineMapPin } from "react-icons/hi2";

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

const ServicePickupPanel = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied" | "error">("idle");
  const [geoMessage, setGeoMessage] = useState("");

  const mapSrc = useMemo(
    () => (coords ? buildGoogleMapsEmbedSrc(coords.lat, coords.lng) : null),
    [coords]
  );

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
        setGeoMessage("Location captured. Our team can use this point for pickup planning.");
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

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50/60 p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pickup service</h2>
        <p className="mt-2 text-sm text-gray-600 max-w-2xl">
          We collect your bike from you. Share your current location on the map so our team can plan pickup.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
          className={`text-sm ${
            geoStatus === "ok" ? "text-emerald-700" : geoStatus === "denied" || geoStatus === "error" ? "text-amber-800" : "text-gray-600"
          }`}
          role="status"
        >
          {geoMessage}
        </p>
      )}

      <div>
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
    </section>
  );
};

export default ServicePickupPanel;
