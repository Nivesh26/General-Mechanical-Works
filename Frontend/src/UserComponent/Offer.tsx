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

      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12">
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
