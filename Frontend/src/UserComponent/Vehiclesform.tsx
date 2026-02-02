import { useState, useRef, useEffect } from "react";

const COMPANIES = ["Yamaha", "Honda", "KTM", "Triumph", "Suzuki"];
const MODELS_BY_COMPANY: Record<string, string[]> = {
  Yamaha: ["R1", "R15", "MT-15", "FZ", "RayZR"],
  Honda: ["CBR", "Activa", "Shine", "Dio", "Hornet"],
  KTM: ["Duke 390", "RC 390", "Adventure", "Duke 250", "RC 200"],
  Triumph: ["Street Triple", "Bonneville", "Tiger", "Speed Triple", "Trident"],
  Suzuki: ["GSX-R", "Gixxer", "Access", "Burgman", "V-Strom"],
};
const COLORS = ["Black", "Red", "Blue", "White", "Silver", "Green", "Yellow", "Orange", "Grey"];

interface ComboboxProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  autoFocus?: boolean;
}

const Combobox = ({ value, onChange, options, placeholder, onKeyDown, className, autoFocus }: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = options.filter((o) => o.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-40 mx-auto">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={className}
      />
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-32 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                className="w-full px-3 py-2 text-center text-[15px] text-[#1a1a1a] hover:bg-gray-100"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm text-center">No match (type to add custom)</div>
          )}
        </div>
      )}
    </div>
  );
};

export interface Vehicle {
  company: string;
  model: string;
  plate: string;
  color: string;
}

export const initialVehicles: Vehicle[] = [
  { company: "Yamaha", model: "R1", plate: "BA 01 1111", color: "Black" },
  
];

interface VehiclesformProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
}

const REQUIRED_MSG = "Please fill the form (Company, Model and License Plate are required).";

type FieldErrors = { company: string; model: string; licensePlate: string };

const Vehiclesform = ({ vehicles, setVehicles }: VehiclesformProps) => {
  const [editingPlate, setEditingPlate] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState("");
  const [editingModel, setEditingModel] = useState("");
  const [editingPlateValue, setEditingPlateValue] = useState("");
  const [editingColor, setEditingColor] = useState("");
  const [validationErrors, setValidationErrors] = useState<FieldErrors | null>(null);

  const isNewVehicleFormValid = () =>
    editingCompany.trim() !== "" && editingModel.trim() !== "" && editingPlateValue.trim() !== "";

  const startEdit = (company: string, model: string, plate: string, color: string) => {
    setValidationErrors(null);
    setEditingPlate(plate);
    setEditingCompany(company);
    setEditingModel(model);
    setEditingPlateValue(plate.startsWith("new-") ? "" : plate);
    setEditingColor(color);
  };

  const saveEdit = () => {
    if (editingPlate === null) return;
    const isNewVehicle = editingPlate.startsWith("new-");
    if (isNewVehicle) {
      if (!isNewVehicleFormValid()) {
        setValidationErrors({
          company: editingCompany.trim() === "" ? REQUIRED_MSG : "",
          model: editingModel.trim() === "" ? REQUIRED_MSG : "",
          licensePlate: editingPlateValue.trim() === "" ? REQUIRED_MSG : "",
        });
        return;
      }
      setValidationErrors(null);
    }

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
    setValidationErrors(null);
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
    if (editingPlate?.startsWith("new-")) {
      if (!isNewVehicleFormValid()) {
        setValidationErrors({
          company: editingCompany.trim() === "" ? REQUIRED_MSG : "",
          model: editingModel.trim() === "" ? REQUIRED_MSG : "",
          licensePlate: editingPlateValue.trim() === "" ? REQUIRED_MSG : "",
        });
        return;
      }
      setValidationErrors(null);
      // Save current new vehicle's form data into the list before adding another
      const plateValue = editingPlateValue.trim();
      setVehicles((prev) =>
        prev.map((v) =>
          v.plate === editingPlate
            ? {
                company: editingCompany,
                model: editingModel,
                plate: plateValue,
                color: editingColor,
              }
            : v
        )
      );
    }
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
            className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-95 transition-opacity cursor-pointer justify-self-center"
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
              <div className="flex flex-col items-center justify-center gap-0.5">
                <div className="flex justify-center w-full">
                  {isEditing ? (
                    <Combobox
                      value={editingCompany}
                      onChange={setEditingCompany}
                      options={COMPANIES}
                      placeholder="Company name"
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
                      autoFocus
                    />
                  ) : (
                    <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base text-center">
                      {company}
                    </span>
                  )}
                </div>
                {isEditing && validationErrors?.company && (
                  <p className="text-red-600 text-xs sm:text-sm text-center mt-0.5" role="alert">
                    {validationErrors.company}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center justify-center gap-0.5">
                <div className="flex justify-center w-full">
                  {isEditing ? (
                    <Combobox
                      value={editingModel}
                      onChange={setEditingModel}
                      options={MODELS_BY_COMPANY[editingCompany] ?? []}
                      placeholder="Bike model"
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base text-center">
                      {model}
                    </span>
                  )}
                </div>
                {isEditing && validationErrors?.model && (
                  <p className="text-red-600 text-xs sm:text-sm text-center mt-0.5" role="alert">
                    {validationErrors.model}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center justify-center gap-0.5">
                <div className="flex justify-center w-full">
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="Plate"
                      value={editingPlateValue.startsWith("new-") ? "" : editingPlateValue}
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
                {isEditing && validationErrors?.licensePlate && (
                  <p className="text-red-600 text-xs sm:text-sm text-center mt-0.5" role="alert">
                    {validationErrors.licensePlate}
                  </p>
                )}
              </div>
              <div className="flex justify-center">
                {isEditing ? (
                  <Combobox
                    value={editingColor}
                    onChange={setEditingColor}
                    options={COLORS}
                    placeholder="Color"
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
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
