import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineCog,
  HiOutlineWrench,
  HiOutlineSparkles,
  HiOutlinePaintBrush,
  HiOutlineArrowRight,
} from "react-icons/hi2";

const services = [
  {
    id: 1,
    title: "Service Work",
    description: "Motorbike care, Servicing",
    Icon: HiOutlineCog,
  },
  {
    id: 2,
    title: "Tyre Repair",
    description: "Tyre Fitting Service",
    Icon: HiOutlineWrench,
  },
  {
    id: 3,
    title: "Bike Wash",
    description: "Premimum Bike Washing, Deep Cleaning",
    Icon: HiOutlineSparkles,
  },
  {
    id: 4,
    title: "Engine Repair",
    description: "Repairing Engine",
    Icon: HiOutlineCog,
  },
  {
    id: 5,
    title: "Dent Painting",
    description: "Repair Dent, Paint",
    Icon: HiOutlinePaintBrush,
  },
  {
    id: 6,
    title: "Modify Bike",
    description: "Modifying Bikes, Tune Engine",
    Icon: HiOutlineWrench,
  },
];

const ServiceCard = ({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: typeof HiOutlineCog;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center transition-colors duration-300 cursor-pointer ${
        isHovered ? "bg-primary" : "bg-gray-100"
      }`}
    >
      {/* Icon circle - black bg, white icon */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black flex items-center justify-center mb-4">
        <Icon
          className={`w-7 h-7 sm:w-8 sm:h-8 ${isHovered ? "text-white" : "text-white"}`}
        />
      </div>
      <h3
        className={`font-bold text-lg sm:text-xl mb-2 ${
          isHovered ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm sm:text-base mb-6 flex-1 ${
          isHovered ? "text-white/90" : "text-gray-600"
        }`}
      >
        {description}
      </p>
      {/* Arrow circle - white + black arrow normally, red + white arrow on hover */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
          isHovered ? "bg-primary" : "bg-white"
        }`}
      >
        <HiOutlineArrowRight
          className={`w-5 h-5 sm:w-6 sm:h-6 ${
            isHovered ? "text-white" : "text-black"
          }`}
        />
      </div>
    </div>
  );
};

const Service = () => {
  return (
    <section className="w-full py-12 sm:py-16 bg-white overflow-hidden">
      <h2 className="text-center text-primary text-2xl sm:text-3xl font-sec font-bold tracking-[4px] uppercase mb-10 sm:mb-12">
        Services
      </h2>

      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              Icon={service.Icon}
            />
          ))}
        </div>

        <div className="flex justify-center mt-10 sm:mt-12">
          <Link
            to="/services"
            className="inline-block px-8 py-3 rounded-full bg-primary text-white font-bold uppercase text-sm tracking-wide hover:bg-primary/90 transition-colors cursor-pointer"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Service;
