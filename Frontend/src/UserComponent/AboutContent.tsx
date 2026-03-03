import React from "react";
import {
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineWrenchScrewdriver,
  HiOutlineHeart,
  HiOutlineCheckBadge,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from "react-icons/hi2";
import AboutHeroImg from "../assets/Hero.png";
import WorkshopImg from "../assets/postergmwai.png";

const stats = [
  { label: "Years in Business", value: "70+", Icon: HiOutlineCalendar },
  { label: "Customers Served", value: "10K+", Icon: HiOutlineUserGroup },
  { label: "Services Offered", value: "50+", Icon: HiOutlineWrenchScrewdriver },
  { label: "Commitment", value: "100%", Icon: HiOutlineHeart },
];

const values = [
  {
    title: "Integrity",
    desc: "Transparent pricing and honest recommendations on every job.",
    Icon: HiOutlineShieldCheck,
  },
  {
    title: "Excellence",
    desc: "Genuine parts and certified workmanship across all services.",
    Icon: HiOutlineCheckBadge,
  },
  {
    title: "Accountability",
    desc: "We stand behind our work and your complete satisfaction.",
    Icon: HiOutlineSparkles,
  },
];

const AboutContent: React.FC = () => {
  return (
    <article className="w-full bg-white">
      {/* Hero */}
      <section
        className="relative w-full min-h-[320px] sm:min-h-[380px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${AboutHeroImg})` }}
        aria-label="About General Mechanical Works"
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4 max-w-2xl">
          <p className="font-sec text-sm font-semibold tracking-[0.2em] uppercase text-white/90 mb-2">
            Established 1951
          </p>
          <h1 className="font-sec text-white text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.15em] uppercase">
            About Us
          </h1>
          <p className="mt-4 text-white/90 text-base sm:text-lg tracking-wide">
            Trusted mechanical services and expertise you can rely on.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section
        className="w-full py-14 sm:py-16 bg-primary text-white"
        aria-label="Company at a glance"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {stats.map(({ label, value, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6" aria-hidden />
                </div>
                <span className="text-2xl sm:text-3xl font-bold font-sec tracking-wide tabular-nums">
                  {value}
                </span>
                <span className="text-white/90 text-sm mt-1.5 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="w-full py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <header className="mb-12 sm:mb-16">
            <h2 className="text-primary text-2xl sm:text-3xl font-sec font-bold tracking-[0.12em] uppercase">
              Our Story
            </h2>
            <div className="mt-2 h-px w-16 bg-primary" />
          </header>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <figure className="w-full lg:w-[45%] shrink-0">
              <img
                src={WorkshopImg}
                alt="General Mechanical Works facility and team"
                className="w-full h-auto rounded-lg object-cover shadow-md"
              />
              <figcaption className="mt-3 text-sm text-gray-500 text-center">
                General Mechanical Works — Facility and team
              </figcaption>
            </figure>

            <div className="w-full lg:w-[55%] space-y-5">
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                <strong className="text-gray-900">General Mechanical Works</strong>{" "}
                provides reliable, high-quality mechanical services tailored to
                our customers&apos; needs. Our experienced team delivers efficient,
                safe, and cost-effective solutions across a wide range of
                mechanical projects.
              </p>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                We are committed to professionalism and customer satisfaction,
                building long-term relationships through trust, transparency, and
                consistent performance.
              </p>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                From routine maintenance to complex repairs, we apply decades of
                expertise and a focus on excellence to every project we undertake.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="w-full py-14 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <header className="mb-12">
            <h2 className="text-primary text-2xl sm:text-3xl font-sec font-bold tracking-[0.12em] uppercase">
              Our Values
            </h2>
            <div className="mt-2 h-px w-16 bg-primary" />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {values.map(({ title, desc, Icon }) => (
              <div
                key={title}
                className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" aria-hidden />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="w-full py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <h2 className="sr-only">Our commitment</h2>
          <blockquote className="border-l-4 border-primary pl-6 sm:pl-8 py-2">
            <p className="text-gray-800 text-lg sm:text-xl leading-relaxed font-medium">
              We don&apos;t just repair vehicles—we keep your investment safe and
              your confidence on the road. Ride with assurance. Ride with General
              Mechanical Works.
            </p>
          </blockquote>
        </div>
      </section>
    </article>
  );
};

export default AboutContent;
