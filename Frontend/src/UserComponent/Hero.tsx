import React from "react";
import hero from "../assets/Hero.png";

const Hero = () => {
  return (
    <div
      className="w-full h-screen flex items-start justify-center relative bg-no-repeat bg-center bg-cover"
      style={{ backgroundImage: `url(${hero})` }}
    >
      <h1 className="mt-11 text-primary text-5xl font-sec font-bold tracking-[4px] uppercase px-[20px] py-[10px]">
        RACEDAY
      </h1>
    </div>
  );
};

export default Hero;
