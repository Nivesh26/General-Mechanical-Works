import { Link } from "react-router-dom";
import niveshImg from "../assets/Nivesh.png";

type ActiveTab = "profile" | "vehicles" | "security";

interface ProfliphotosProps {
  activeTab?: ActiveTab;
  firstName?: string;
  lastName?: string;
}

const Profliephotos = ({ activeTab = "profile", firstName = "Nivesh", lastName = "Shrestha" }: ProfliphotosProps) => {
  return (
    <section className="w-full pt-8 pb-4">
      {/* Cover + Upload button; only profile photo in front */}
      <div className="relative rounded-t-2xl overflow-visible h-[200px] sm:h-[240px]">
        <div
          className="absolute inset-0 rounded-t-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #bd162c 0%, #8b1a2a 35%, #6b1520 60%, #a01d28 80%, #4a1018 100%)",
          }}
        />
        {/* Swirling red abstract overlay */}
        <div
          className="absolute inset-0 rounded-t-2xl opacity-50"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 70% 50% at 30% 40%, rgba(220,60,60,0.35), transparent 50%),
              radial-gradient(ellipse 50% 70% at 70% 60%, rgba(120,25,25,0.3), transparent 55%)
            `,
          }}
        />
        <button
          type="button"
          className="absolute top-4 right-4 z-10 px-4 py-2 rounded-full bg-white text-black text-sm font-medium border border-gray-200 hover:bg-gray-50 cursor-pointer"
        >
          Upload Cover
        </button>
        {/* Only photo overlaps banner, in front - 70px left margin */}
        <div className="absolute left-[70px] bottom-0 z-10 translate-y-1/2">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[28px] overflow-hidden border-4 border-white shadow-md bg-gray-100">
            <img
              src={niveshImg}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Name + Change/Delete + tabs - 70px left to align with photo */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-16 sm:pt-20 pl-[70px] sm:pl-[70px] pr-0 sm:pr-2">
        <div className="flex flex-wrap items-end gap-4 sm:gap-6">
          {/* Spacer for pic width + Change/Delete */}
          <div className="w-32 sm:w-36 shrink-0 flex flex-col items-start">
            <div className="flex gap-10 ">
              <button type="button" className="text-primary text-sm font-medium underline cursor-pointer">
                Change
              </button>
              <button type="button" className="text-primary text-sm font-medium underline cursor-pointer">
                Delete
              </button>
            </div>
          </div>


          {/* Name + subtitle - a little up */}
          <div className="pb-10 -mt-24 sm:-mt-25">
            <h1 className="text-primary font-bold text-xl sm:text-2xl">
              {firstName} {lastName}
            </h1>
            <p className="text-black text-sm sm:text-base mt-0.5 font-normal">
              Yamaha R1 (BA 01 1111)
            </p>
          </div>
        </div>

        {/* Tabs: PROFILE | VEHICLES | SECURITY – active tab gets red underline */}
        <div className="flex gap-6 sm:gap-8 pb-3 border-b border-gray-200 shrink-0">
          <Link
            to="/profile"
            className={`text-black text-sm font-medium uppercase tracking-wide border-b-2 pb-3 -mb-[13px] ${
              activeTab === "profile" ? "border-primary" : "border-gray-300 hover:text-primary hover:border-primary"
            }`}
          >
            Profile
          </Link>
          <Link
            to="/profile/vehicles"
            className={`text-black text-sm font-medium uppercase tracking-wide border-b-2 pb-3 -mb-[13px] ${
              activeTab === "vehicles" ? "border-primary" : "border-gray-300 hover:text-primary hover:border-primary"
            }`}
          >
            Vehicles
          </Link>
          <Link
            to="/profile/security"
            className={`text-black text-sm font-medium uppercase tracking-wide border-b-2 pb-3 -mb-[13px] ${
              activeTab === "security" ? "border-primary" : "border-gray-300 hover:text-primary hover:border-primary"
            }`}
          >
            Security
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Profliephotos;
