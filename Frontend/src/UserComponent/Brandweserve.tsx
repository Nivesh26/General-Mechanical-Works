import Bajaj from "../assets/Bajaj.png";
import Honda from "../assets/Honda.png";
import TRX from "../assets/TRX.png";
import Yamaha from "../assets/yamaha.svg";
import KTM from "../assets/Ktm.png";
import RE from "../assets/Royal Enfield.png";
import Triumph from "../assets/triumph .png";
import Hero from "../assets/Herologo.png";
import Suzuki from "../assets/Suzuki.png";

const brands = [
  { name: "Bajaj", logo: Bajaj },
  { name: "Honda", logo: Honda },
  { name: "TRX", logo: TRX },
  {name: "Yamaha", logo: Yamaha},
  {name: "KTM", logo: KTM},
  {name: "Royal Enfield", logo: RE},
  {name: "Triumph", logo: Triumph},
  {name: "Hero", logo: Hero},
  {name: "Suzuki", logo: Suzuki},
];

const Brandweserve = () => {
  return (
    <section className="w-full py-12 sm:py-16 bg-white overflow-hidden">
      <h2 className="text-center text-primary text-2xl sm:text-3xl font-sec font-bold tracking-[4px] uppercase mb-10 sm:mb-12">
        Brands We Serve
      </h2>

      <div className="relative">
        <div className="flex animate-scroll">
          {[...brands, ...brands, ...brands].map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="shrink-0 mx-3 sm:mx-6 w-32 sm:w-40 h-24 sm:h-28 flex items-center justify-center bg-gray-100 rounded-xl border-2 border-gray-200 px-4 hover:border-primary transition-colors duration-300 cursor-pointer"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-16 sm:max-h-20 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brandweserve;
