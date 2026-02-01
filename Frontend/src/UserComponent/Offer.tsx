import { useState } from "react";
import Poster1 from "../assets/Poster1.png";
import Poster2 from "../assets/Poster2.png";
import Poster3 from "../assets/Poster3.png";

const offers = [
  { id: 1, image: Poster1, alt: "Shreshtho - 40% discount on motorcycles" },
  { id: 2, image: Poster2, alt: "Zemech - We can fix everything" },
  { id: 3, image: Poster3, alt: "Garage on Call - Bike repair service at doorstep" },
];

const Offer = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedOffer = offers.find((o) => o.id === selectedId);

  return (
    <section className="w-full py-12 sm:py-16 bg-white overflow-hidden">
      {/* Fullscreen lightbox - click backdrop or close to minimize */}
      {selectedOffer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-pointer"
          onClick={() => setSelectedId(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Viewing offer"
        >
          <button
            type="button"
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white border-2 border-gray-300 flex items-center justify-center text-gray-700 cursor-pointer"
            onClick={() => setSelectedId(null)}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div
            className="relative max-w-7xl w-full max-h-[95vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedOffer.image}
              alt={selectedOffer.alt}
              className="max-w-full max-h-[95vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      <h2 className="text-center text-primary text-2xl sm:text-3xl font-sec font-bold italic tracking-[4px] uppercase mb-10 sm:mb-12">
        Latest Offers
      </h2>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8">
        {/* Left arrow - inside content, static for now */}
        <button
          type="button"
          className="absolute -left-9 sm:-left-11 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
          aria-label="Previous offer"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right arrow - inside content, static for now */}
        <button
          type="button"
          className="absolute -right-9 sm:-right-11 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
          aria-label="Next offer"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 cursor-pointer"
              onClick={() => setSelectedId(offer.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedId(offer.id)}
              aria-label={`View ${offer.alt}`}
            >
              <img
                src={offer.image}
                alt={offer.alt}
                className="w-full h-auto object-cover object-center"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offer;
