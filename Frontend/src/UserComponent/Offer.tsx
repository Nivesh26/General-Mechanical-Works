import Poster1 from "../assets/Poster1.png";
import Poster2 from "../assets/Poster2.png";
import Poster3 from "../assets/Poster3.png";

const offers = [
  { id: 1, image: Poster1, alt: "Shreshtho - 40% discount on motorcycles" },
  { id: 2, image: Poster2, alt: "Zemech - We can fix everything" },
  { id: 3, image: Poster3, alt: "Garage on Call - Bike repair service at doorstep" },
];

const Offer = () => {
  return (
    <section className="w-full py-12 sm:py-16 bg-white overflow-hidden">
      <h2 className="text-center text-primary text-2xl sm:text-3xl font-sec font-bold italic tracking-[4px] uppercase mb-10 sm:mb-12">
        Latest Offers
      </h2>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8">
        {/* Left arrow - static for now */}
        <button
          type="button"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
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

        {/* Right arrow - static for now */}
        <button
          type="button"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 px-12 sm:px-14">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-2xl overflow-hidden shadow-lg border border-gray-200"
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
