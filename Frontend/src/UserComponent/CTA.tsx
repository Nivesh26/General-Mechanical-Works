import { Link } from "react-router-dom";
import CtaImg from "../assets/Cta.png";

const CTA = () => {
  return (
    <section
      className="relative w-full min-h-[260px] sm:min-h-[300px] flex items-center justify-center bg-cover bg-center bg-no-repeat py-12 sm:py-16"
      style={{ backgroundImage: `url(${CtaImg})` }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-8 flex flex-col items-center text-center">
        <h2 className="font-sec text-white text-2xl sm:text-3xl lg:text-4xl font-bold italic tracking-wide mb-3 sm:mb-4 drop-shadow-md text-center">
          Get Your Ride
          <br />
          <span className="font-sec whitespace-nowrap">Running Smoothly!</span>
        </h2>
        <p className="text-white text-sm sm:text-base leading-relaxed mb-5 sm:mb-6 max-w-xl mx-auto">
          Don&apos;t let maintenance slow you down. Book your motorbike service today! Whether
          it&apos;s a quick tune-up, full servicing, or emergency repairs, our expert mechanics
          have you covered.
        </p>
        <Link
          to="/services"
          className="inline-block px-8 py-3 rounded-full bg-primary text-white font-bold text-sm sm:text-base tracking-wide hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Try Now
        </Link>
      </div>
    </section>
  );
};

export default CTA;
