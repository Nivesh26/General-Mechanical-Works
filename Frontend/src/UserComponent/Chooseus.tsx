import {
  HiOutlineTrophy,
  HiOutlineWrenchScrewdriver,
  HiOutlineSparkles,
  HiOutlineHandRaised,
} from "react-icons/hi2";
import WorkshopImg from "../assets/postergmwai.png";

const features = [
  {
    title: "70+ Years of Expertise",
    description: "Mastering motorcycle repair from vintage classics to modern superbikes.",
    Icon: HiOutlineTrophy,
  },
  {
    title: "Expert Technicians",
    description: "Skilled mechanics delivering top-notch solutions for all makes and models.",
    Icon: HiOutlineWrenchScrewdriver,
  },
  {
    title: "Premium Service",
    description: "Using genuine parts for peak performance and safety.",
    Icon: HiOutlineSparkles,
  },
  {
    title: "Complete Care",
    description: "From maintenance to custom mods, we handle all your bike's needs.",
    Icon: HiOutlineHandRaised,
  },
];

const Chooseus = () => {
  return (
    <section className="w-full py-12 sm:py-16 bg-white overflow-hidden">
      <h2 className="text-center text-primary text-2xl sm:text-3xl font-sec font-bold tracking-[4px] uppercase mb-10 sm:mb-12">
        Why Choose Us?
      </h2>

      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-stretch">
          {/* Left column - Workshop image */}
          <div className="w-full lg:w-1/2 shrink-0">
            <img
              src={WorkshopImg}
              alt="General Mechanical Works - Motorcycle repair workshop since 1951"
              className="w-full h-auto rounded-2xl object-cover shadow-lg"
            />
          </div>

          {/* Right column - Text content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-8">
              Established in 1951, General Mechanical Works has been a trusted name in motorcycle
              repair and maintenance for over seven decades. Our rich history and expertise set us
              apart, ensuring that every bike we service receives top-quality care.
            </p>

            {/* Feature blocks - 2x2 grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
              {features.map(({ title, description, Icon }) => (
                <div key={title} className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
              At General Mechanical Works, we don&apos;t just fix motorcycles; we keep your passion
              for riding alive. Ride with confidence, ride with us!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Chooseus;
