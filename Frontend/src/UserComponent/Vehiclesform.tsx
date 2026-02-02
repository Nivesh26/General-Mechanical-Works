const Vehiclesform = () => {
  const vehicles = [
    { name: "Yamaha R1", plate: "BA 01 1111" },
    { name: "Honda CBR", plate: "BA 02 2222" },
    { name: "Suzuki GSX", plate: "BA 03 3333" },
  ];

  return (
    <section className="w-full py-8">
      <div className="border-t border-gray-200">
        {/* My Vehicles | License Plate header row */}
        <div className="flex items-center gap-4 py-4 border-b border-gray-200">
          <span className="text-[#1a1a1a] font-semibold text-[15px] sm:text-base w-32 sm:w-40 shrink-0">
            My Vehicles
          </span>
          <span className="flex-1 text-center text-[#1a1a1a] font-semibold text-[15px] sm:text-base min-w-0">
            License Plate
          </span>
          <button
            type="button"
            className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-95 transition-opacity cursor-pointer shrink-0"
          >
            Add Vehicle
          </button>
        </div>

        {/* Vehicle rows – label | value (middle) | Edit Remove */}
        {vehicles.map(({ name, plate }) => (
          <div
            key={plate}
            className="flex items-center gap-4 py-4 border-b border-gray-200"
          >
            <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base w-32 sm:w-40 shrink-0">
              {name}
            </span>
            <span className="flex-1 text-center text-gray-500 text-[15px] sm:text-base min-w-0 truncate">
              {plate}
            </span>
            <div className="flex gap-4 shrink-0">
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
