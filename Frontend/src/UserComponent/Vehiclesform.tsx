import { useState } from "react";

const initialVehicles = [
  { name: "Yamaha R1", plate: "BA 01 1111" },
  { name: "Honda CBR", plate: "BA 02 2222" },
  { name: "Suzuki GSX", plate: "BA 03 3333" },
];

const Vehiclesform = () => {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [editingPlate, setEditingPlate] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingPlateValue, setEditingPlateValue] = useState("");

  const startEdit = (name: string, plate: string) => {
    setEditingPlate(plate);
    setEditingName(name);
    setEditingPlateValue(plate);
  };

  const saveEdit = () => {
    if (editingPlate === null) return;
    setVehicles((prev) =>
      prev.map((v) =>
        v.plate === editingPlate
          ? { name: editingName, plate: editingPlateValue }
          : v
      )
    );
    setEditingPlate(null);
    setEditingName("");
    setEditingPlateValue("");
  };

  const cancelEdit = () => {
    setEditingPlate(null);
    setEditingName("");
    setEditingPlateValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
  };

  const removeVehicle = (plate: string) => {
    setVehicles((prev) => prev.filter((v) => v.plate !== plate));
    if (editingPlate === plate) cancelEdit();
  };

  return (
    <section className="w-full py-6 sm:py-8 px-2 sm:px-0">
      <div className="border-t border-gray-200">
        {/* My Vehicles | License Plate header row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200">
          <span className="text-[#1a1a1a] font-semibold text-[15px] sm:text-base w-full sm:w-32 sm:min-w-32 shrink-0">
            My Vehicles
          </span>
          <span className="flex-1 text-center text-[#1a1a1a] font-semibold text-[15px] sm:text-base min-w-0 hidden sm:block">
            License Plate
          </span>
          <button
            type="button"
            className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-95 transition-opacity cursor-pointer shrink-0 w-fit"
          >
            Add Vehicle
          </button>
        </div>

        {/* Vehicle rows */}
        {vehicles.map(({ name, plate }) => {
          const isEditing = editingPlate === plate;
          return (
            <div
              key={plate}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200"
            >
              <div className="w-full sm:w-32 sm:min-w-32 shrink-0">
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Vehicle name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-[15px] sm:text-base focus:outline-none focus:border-primary"
                    autoFocus
                  />
                ) : (
                  <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base">
                    {name}
                  </span>
                )}
              </div>
              <div className="flex-1 w-full min-w-0 flex justify-center">
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Plate"
                    value={editingPlateValue}
                    onChange={(e) => setEditingPlateValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full max-w-40 bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
                  />
                ) : (
                  <span className="text-center text-gray-500 text-[15px] sm:text-base min-w-0 truncate block w-full">
                    {plate}
                  </span>
                )}
              </div>
              <div className="flex gap-3 sm:gap-4 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    isEditing ? saveEdit() : startEdit(name, plate)
                  }
                  className="text-primary text-sm font-medium hover:underline cursor-pointer"
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-gray-600 text-sm font-medium hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeVehicle(plate)}
                    className="text-primary text-sm font-medium hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Vehiclesform;
