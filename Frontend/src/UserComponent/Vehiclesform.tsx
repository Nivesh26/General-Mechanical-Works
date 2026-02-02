import { useState } from "react";

const initialVehicles = [
  { company: "Yamaha", model: "R1", plate: "BA 01 1111", color: "Black" },
  { company: "Honda", model: "CBR", plate: "BA 02 2222", color: "Red" },
  { company: "Suzuki", model: "GSX", plate: "BA 03 3333", color: "Blue" },
];

const Vehiclesform = () => {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [editingPlate, setEditingPlate] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState("");
  const [editingModel, setEditingModel] = useState("");
  const [editingPlateValue, setEditingPlateValue] = useState("");
  const [editingColor, setEditingColor] = useState("");

  const startEdit = (company: string, model: string, plate: string, color: string) => {
    setEditingPlate(plate);
    setEditingCompany(company);
    setEditingModel(model);
    setEditingPlateValue(plate);
    setEditingColor(color);
  };

  const saveEdit = () => {
    if (editingPlate === null) return;
    const isNewVehicle = editingPlate.startsWith("new-");
    if (isNewVehicle && !editingPlateValue.trim()) return; // Require plate for new vehicle

    const newPlate = editingPlateValue.trim();
    setVehicles((prev) =>
      prev.map((v) =>
        v.plate === editingPlate
          ? { company: editingCompany, model: editingModel, plate: isNewVehicle ? newPlate : (newPlate || v.plate), color: editingColor }
          : v
      )
    );
    setEditingPlate(null);
    setEditingCompany("");
    setEditingModel("");
    setEditingPlateValue("");
    setEditingColor("");
  };

  const cancelEdit = () => {
    const isNewVehicle = editingPlate?.startsWith("new-");
    if (isNewVehicle) {
      setVehicles((prev) => prev.filter((v) => v.plate !== editingPlate));
    }
    setEditingPlate(null);
    setEditingCompany("");
    setEditingModel("");
    setEditingPlateValue("");
    setEditingColor("");
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

  const addVehicle = () => {
    const tempId = `new-${Date.now()}`;
    const newVehicle = { company: "", model: "", plate: tempId, color: "" };
    setVehicles((prev) => [...prev, newVehicle]);
    startEdit("", "", tempId, "");
  };

  return (
    <section className="w-full py-6 sm:py-8 px-2 sm:px-0">
      <div className="border-t border-gray-200">
        {/* Company | Model | License Plate | Color header row */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-center gap-4 sm:gap-6 py-3 sm:py-4 border-b border-gray-200">
          <span className="text-[#1a1a1a] font-semibold text-[15px] sm:text-base text-center">
            Company
          </span>
          <span className="text-[#1a1a1a] font-semibold text-[15px] sm:text-base text-center">
            Model
          </span>
          <span className="text-[#1a1a1a] font-semibold text-[15px] sm:text-base text-center">
            License Plate
          </span>
          <span className="text-[#1a1a1a] font-semibold text-[15px] sm:text-base text-center">
            Color
          </span>
          <button
            type="button"
            onClick={addVehicle}
            disabled={editingPlate?.startsWith("new-") ?? false}
            className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-95 transition-opacity cursor-pointer justify-self-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Add Vehicle
          </button>
        </div>

        {/* Vehicle rows */}
        {vehicles.map(({ company, model, plate, color }) => {
          const isEditing = editingPlate === plate;
          return (
            <div
              key={plate}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-center gap-4 sm:gap-6 py-3 sm:py-4 border-b border-gray-200"
            >
              <div className="flex justify-center">
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Company name"
                    value={editingCompany}
                    onChange={(e) => setEditingCompany(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full max-w-40 bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
                    autoFocus
                  />
                ) : (
                  <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base text-center">
                    {company}
                  </span>
                )}
              </div>
              <div className="flex justify-center">
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Bike model"
                    value={editingModel}
                    onChange={(e) => setEditingModel(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full max-w-40 bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
                  />
                ) : (
                  <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base text-center">
                    {model}
                  </span>
                )}
              </div>
              <div className="flex justify-center">
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
                  <span className="text-center text-gray-500 text-[15px] sm:text-base">
                    {plate}
                  </span>
                )}
              </div>
              <div className="flex justify-center">
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Color"
                    value={editingColor}
                    onChange={(e) => setEditingColor(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full max-w-40 bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
                  />
                ) : (
                  <span className="text-center text-gray-500 text-[15px] sm:text-base">
                    {color}
                  </span>
                )}
              </div>
              <div className="flex gap-3 sm:gap-4 justify-center">
                <button
                  type="button"
                  onClick={() =>
                    isEditing ? saveEdit() : startEdit(company, model, plate, color)
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
