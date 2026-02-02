import React from 'react'

const Vehiclesform = () => {
  const vehicles = [
    { name: "Yamaha R1", plate: "BA 01 1111" },
    { name: "Honda CBR", plate: "BA 02 2222" },
    { name: "Suzuki GSX", plate: "BA 03 3333" },
  ];

  return (
    <section className="w-full py-8">
      <div className="border-t border-gray-200">
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
          <h3 className="text-[#1a1a1a] font-semibold text-base sm:text-lg">
            My Vehicles
          </h3>
          <button
            type="button"
            className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-95 transition-opacity cursor-pointer"
          >
            Add Vehicle
          </button>
        </div>
        {vehicles.map(({ name, plate }) => (
          <div
            key={plate}
            className="flex flex-wrap items-center gap-4 py-4 border-b border-gray-200"
          >
            <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base">
              {name}
            </span>
            <span className="text-gray-500 text-[15px] sm:text-base">
              {plate}
            </span>
            <div className="ml-auto flex gap-4">
              <button
                type="button"
                className="text-primary text-sm font-medium hover:underline cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                className="text-primary text-sm font-medium hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Vehiclesform;
