import hero from "../assets/Hero.png";

const Hero = () => {
  return (
    <div
      className="w-full min-h-[50vh] sm:min-h-[70vh] lg:h-screen flex items-start justify-center relative bg-no-repeat bg-center bg-cover"
      style={{ backgroundImage: `url(${hero})` }}
    >
      <h1 className="mt-6 sm:mt-11 text-primary text-3xl sm:text-4xl md:text-5xl font-sec font-bold tracking-[2px] sm:tracking-[4px] uppercase px-4 py-2 sm:px-5 sm:py-2.5 text-center">
        RACEDAY
      </h1>
    </div>
  );
};

export default Hero;
