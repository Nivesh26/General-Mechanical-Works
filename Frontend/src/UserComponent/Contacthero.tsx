import React from "react";
import contactushero from "../assets/Contactus.png";
const Contacthero = () => {
  return (
    <div>
      <section
        className="bg-center bg-cover h-[300px] flex items-center justify-center relative 
        sm:h-[200px] px-5"
        style={{
          backgroundImage: `url(${contactushero})`,
        }}
      >
        <h1 className="font-sec  text-primary text-[48px] font-bold tracking-[4px] uppercase py-[10px] px-[20px]">
          CONTACT US
        </h1>
      </section>
    </div>
  );
};

export default Contacthero
