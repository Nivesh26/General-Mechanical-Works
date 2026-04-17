import { useState, useRef, useEffect } from "react";
import plateEmbossedRef from "../assets/NepaliNumberPlate1.png";
import plateTraditionalRef from "../assets/NepaliNumberPlate2.png";

const COMPANIES = ["Yamaha", "Honda", "KTM", "Triumph", "Suzuki"];
const MODELS_BY_COMPANY: Record<string, string[]> = {
  Yamaha: ["R1", "R15", "MT-15", "FZ", "RayZR"],
  Honda: ["CBR", "Activa", "Shine", "Dio", "Hornet"],
  KTM: ["Duke 390", "RC 390", "Adventure", "Duke 250", "RC 200"],
  Triumph: ["Street Triple", "Bonneville", "Tiger", "Speed Triple", "Trident"],
  Suzuki: ["GSX-R", "Gixxer", "Access", "Burgman", "V-Strom"],
};
const COLORS = ["Black", "Red", "Blue", "White", "Silver", "Green", "Yellow", "Orange", "Grey"];

/** Nepal provinces as used on current embossed plates (province name top band). */
const NEPAL_PROVINCES = [
  "Bagmati",
  "Koshi",
  "Madhesh",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
] as const;

/** Legacy red plate: zone code in Devanagari + lot + category letter + registration number. */
const TRADITIONAL_ZONES: { label: string; dev: string }[] = [
  { label: "Bagmati — बा", dev: "बा" },
  { label: "Lumbini — ला", dev: "ला" },
  { label: "Gandaki — ग", dev: "ग" },
  { label: "Koshi — को", dev: "को" },
  { label: "Madhesh — ज", dev: "ज" },
  { label: "Karnali — क", dev: "क" },
  { label: "Sudurpashchim — स", dev: "स" },
];

const TRADITIONAL_CATEGORIES: { label: string; dev: string }[] = [
  { label: "च — private (common)", dev: "च" },
  { label: "प — passenger", dev: "प" },
  { label: "क — goods / commercial", dev: "क" },
  { label: "ख — hire", dev: "ख" },
];

export type NepaliPlateFormat = "embossed" | "traditional";

export interface NepaliEmbossedParts {
  province: string;
  category: string;
  lot: string;
  digits: string;
}

export interface NepaliTraditionalParts {
  zone: string;
  lot: string;
  category: string;
  digits: string;
}

const emptyEmbossed = (): NepaliEmbossedParts => ({
  province: "",
  category: "",
  lot: "",
  digits: "",
});

const emptyTraditional = (): NepaliTraditionalParts => ({
  zone: "",
  lot: "",
  category: "",
  digits: "",
});

const DEV_DIGITS: Record<string, string> = {
  "0": "०",
  "1": "१",
  "2": "२",
  "3": "३",
  "4": "४",
  "5": "५",
  "6": "६",
  "7": "७",
  "8": "८",
  "9": "९",
};

export function toDevanagariDigits(arabic: string): string {
  return arabic.replace(/\d/g, (d) => DEV_DIGITS[d] ?? d);
}

function composeEmbossedPlate(e: NepaliEmbossedParts): string {
  const p = e.province.trim();
  const c = e.category.trim().toUpperCase();
  const l = e.lot.trim().toUpperCase();
  const d = e.digits.trim();
  if (!p && !c && !l && !d) return "";
  return [p.toUpperCase(), c, l, d].filter(Boolean).join(" ");
}

function composeTraditionalPlate(t: NepaliTraditionalParts): string {
  const lot = t.lot.trim();
  const dig = t.digits.trim();
  if (!t.zone && !lot && !t.category && !dig) return "";
  return `${t.zone} ${toDevanagariDigits(lot)} ${t.category} ${toDevanagariDigits(dig)}`.replace(/\s+/g, " ").trim();
}

interface ComboboxProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  autoFocus?: boolean;
  align?: "left" | "center";
}

const Combobox = ({
  value,
  onChange,
  options,
  placeholder,
  onKeyDown,
  className,
  autoFocus,
  align = "center",
}: ComboboxProps) => {
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
    <div ref={ref} className={`relative w-full max-w-40 ${align === "left" ? "ml-0 mr-auto" : "mx-auto"}`}>
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
  plateFormat: NepaliPlateFormat;
  /** Exactly one vehicle should be the user’s primary bike for bookings and display. */
  isMainBike?: boolean;
  embossed?: NepaliEmbossedParts;
  traditional?: NepaliTraditionalParts;
}

export function formatDisplayPlate(v: Vehicle): string {
  if (v.plate.startsWith("new-")) return "";
  const format = v.plateFormat ?? "embossed";
  if (format === "embossed" && v.embossed) {
    const e = v.embossed;
    if (e.province || e.category || e.lot || e.digits) {
      const tail = [e.category, e.lot, e.digits].filter(Boolean).join(" ");
      return e.province ? `${e.province} · ${tail}`.trim() : tail;
    }
  }
  if (format === "traditional" && v.traditional) {
    const t = v.traditional;
    if (t.zone || t.lot || t.category || t.digits) {
      return composeTraditionalPlate(t);
    }
  }
  return v.plate;
}

export const initialVehicles: Vehicle[] = [
  {
    company: "Yamaha",
    model: "R1",
    plate: "BAGMATI B AB 0123",
    color: "Black",
    plateFormat: "embossed",
    isMainBike: true,
    embossed: { province: "Bagmati", category: "B", lot: "AB", digits: "0123" },
  },
];

interface VehiclesformProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
}

const REQUIRED_MSG = "Please fill the form (Company, Model and License Plate are required).";

type FieldErrors = { company: string; model: string; licensePlate: string };

function validatePlateParts(
  format: NepaliPlateFormat,
  embossed: NepaliEmbossedParts,
  traditional: NepaliTraditionalParts
): string {
  if (format === "embossed") {
    const e = embossed;
    if (!e.province.trim()) return "Select province for embossed plate.";
    if (!/^[A-Za-z]$/.test(e.category.trim())) return "Category must be one letter (e.g. B for two-wheeler).";
    if (!/^[A-Za-z0-9]{1,2}$/.test(e.lot.trim())) return "Lot code: 1–2 letters or digits (e.g. AB).";
    if (!/^\d{4}$/.test(e.digits.trim())) return "Registration must be exactly 4 digits.";
    return "";
  }
  const t = traditional;
  if (!t.zone.trim()) return "Select zone (Devanagari code) for traditional plate.";
  if (!/^\d{1,2}$/.test(t.lot.trim())) return "Lot: 1–2 digits.";
  if (!t.category.trim()) return "Select vehicle category (e.g. च).";
  if (!/^\d{4}$/.test(t.digits.trim())) return "Registration must be exactly 4 digits.";
  return "";
}

const devanagariStack = { fontFamily: '"Noto Sans Devanagari", "Mukta", system-ui, sans-serif' };

function LiveEmbossedPreview({ e }: { e: NepaliEmbossedParts }) {
  const prov = e.province.trim().toUpperCase() || "PROVINCE";
  const mid = `${e.category.trim().toUpperCase() || "—"} ${e.lot.trim().toUpperCase() || "—"}`.trim();
  const nums = e.digits.trim() || "0000";
  return (
    <div
      className="rounded-lg border-2 border-black bg-white px-3 py-2 shadow-sm max-w-[220px] mx-auto"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.08)" }}
    >
      <p className="text-center text-[10px] font-bold tracking-[0.2em] text-black uppercase">{prov}</p>
      <p className="text-center text-lg font-extrabold tracking-widest text-black leading-tight">{mid}</p>
      <p className="text-center text-xl font-black tracking-[0.25em] text-black tabular-nums">{nums}</p>
    </div>
  );
}

function LiveTraditionalPreview({ t }: { t: NepaliTraditionalParts }) {
  const lot = toDevanagariDigits(t.lot.trim() || "००");
  const dig = toDevanagariDigits(t.digits.trim() || "००००");
  const line1 = `${t.zone || "बा"} ${lot} ${t.category || "च"}`.trim();
  return (
    <div
      className="rounded-lg px-4 py-3 max-w-[220px] mx-auto text-center shadow-sm border border-red-900/20"
      style={{
        background: "linear-gradient(180deg, #e53935 0%, #c62828 100%)",
        ...devanagariStack,
      }}
    >
      <p className="text-white text-sm font-bold leading-snug">{line1}</p>
      <p className="text-white text-2xl font-extrabold mt-1 tracking-wide">{dig}</p>
    </div>
  );
}

interface PlateFormatPickerProps {
  value: NepaliPlateFormat;
  onChange: (f: NepaliPlateFormat) => void;
}

function PlateFormatPicker({ value, onChange }: PlateFormatPickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange("embossed")}
        className={`rounded-xl border-2 p-3 text-left transition-all ${
          value === "embossed"
            ? "border-primary bg-primary/6 ring-1 ring-primary/30"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <div className="flex gap-3">
          <div className="shrink-0 w-24 rounded-md overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={plateEmbossedRef}
              alt="Reference: Nepal embossed white license plate"
              className="w-full h-auto object-cover object-center"
            />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="font-semibold text-[#1a1a1a] text-sm">Embossed plate (current)</p>
            <p className="text-xs text-gray-600 mt-1 leading-snug">
              White plate, province on top, Latin letters and numbers (e.g. Bagmati · B AB 0123).
            </p>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onChange("traditional")}
        className={`rounded-xl border-2 p-3 text-left transition-all ${
          value === "traditional"
            ? "border-primary bg-primary/6 ring-1 ring-primary/30"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <div className="flex gap-3">
          <div className="shrink-0 w-24 rounded-md overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={plateTraditionalRef}
              alt="Reference: Nepal traditional red Devanagari license plate"
              className="w-full h-auto object-cover object-center"
            />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="font-semibold text-[#1a1a1a] text-sm">Traditional red plate</p>
            <p className="text-xs text-gray-600 mt-1 leading-snug">
              Older style: red background, white Devanagari text (e.g. बा १२ च / १२३४).
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

const Vehiclesform = ({ vehicles, setVehicles }: VehiclesformProps) => {
  const [editingPlate, setEditingPlate] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState("");
  const [editingModel, setEditingModel] = useState("");
  const [editingColor, setEditingColor] = useState("");
  const [editingPlateFormat, setEditingPlateFormat] = useState<NepaliPlateFormat>("embossed");
  const [editingEmbossed, setEditingEmbossed] = useState<NepaliEmbossedParts>(emptyEmbossed);
  const [editingTraditional, setEditingTraditional] = useState<NepaliTraditionalParts>(emptyTraditional);
  const [validationErrors, setValidationErrors] = useState<FieldErrors | null>(null);

  const composedPlate = (): string => {
    if (editingPlateFormat === "embossed") return composeEmbossedPlate(editingEmbossed);
    return composeTraditionalPlate(editingTraditional);
  };

  const isNewVehicleFormValid = () => {
    const plateErr = validatePlateParts(editingPlateFormat, editingEmbossed, editingTraditional);
    return (
      editingCompany.trim() !== "" &&
      editingModel.trim() !== "" &&
      plateErr === "" &&
      composedPlate() !== ""
    );
  };

  const startEdit = (v: Vehicle) => {
    if (editingPlate && editingPlate.startsWith("new-") && v.plate !== editingPlate) {
      setVehicles((prev) => prev.filter((x) => x.plate !== editingPlate));
    }
    setValidationErrors(null);
    setEditingPlate(v.plate);
    setEditingCompany(v.company);
    setEditingModel(v.model);
    setEditingColor(v.color);
    setEditingPlateFormat(v.plateFormat ?? "embossed");
    setEditingEmbossed(v.embossed ? { ...v.embossed } : emptyEmbossed());
    setEditingTraditional(v.traditional ? { ...v.traditional } : emptyTraditional());
  };

  const buildVehiclePayload = (): Omit<Vehicle, never> => {
    const plateText = composedPlate();
    const base = {
      company: editingCompany,
      model: editingModel,
      color: editingColor,
      plate: plateText,
      plateFormat: editingPlateFormat,
    };
    if (editingPlateFormat === "embossed") {
      return {
        ...base,
        plate: plateText,
        embossed: {
          province: editingEmbossed.province.trim(),
          category: editingEmbossed.category.trim().toUpperCase(),
          lot: editingEmbossed.lot.trim().toUpperCase(),
          digits: editingEmbossed.digits.trim(),
        },
        traditional: undefined,
      };
    }
    return {
      ...base,
      plate: plateText,
      traditional: {
        zone: editingTraditional.zone.trim(),
        lot: editingTraditional.lot.trim(),
        category: editingTraditional.category.trim(),
        digits: editingTraditional.digits.trim(),
      },
      embossed: undefined,
    };
  };

  const saveEdit = () => {
    if (editingPlate === null) return;
    const isNewVehicle = editingPlate.startsWith("new-");
    const plateErr = validatePlateParts(editingPlateFormat, editingEmbossed, editingTraditional);
    const plateOk = plateErr === "" && composedPlate() !== "";

    if (isNewVehicle) {
      if (editingCompany.trim() === "" || editingModel.trim() === "" || !plateOk) {
        setValidationErrors({
          company: editingCompany.trim() === "" ? REQUIRED_MSG : "",
          model: editingModel.trim() === "" ? REQUIRED_MSG : "",
          licensePlate: !plateOk ? plateErr || REQUIRED_MSG : "",
        });
        return;
      }
      setValidationErrors(null);
    } else {
      if (!plateOk) {
        setValidationErrors({
          company: "",
          model: "",
          licensePlate: plateErr || "Complete all license plate fields.",
        });
        return;
      }
      setValidationErrors(null);
    }

    const payload = buildVehiclePayload();
    setVehicles((prev) =>
      prev.map((x) =>
        x.plate === editingPlate ? { ...x, ...payload, plate: payload.plate, isMainBike: x.isMainBike } : x
      )
    );
    setEditingPlate(null);
    setEditingCompany("");
    setEditingModel("");
    setEditingColor("");
    setEditingPlateFormat("embossed");
    setEditingEmbossed(emptyEmbossed());
    setEditingTraditional(emptyTraditional());
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
    setEditingColor("");
    setEditingPlateFormat("embossed");
    setEditingEmbossed(emptyEmbossed());
    setEditingTraditional(emptyTraditional());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
  };

  const removeVehicle = (plate: string) => {
    setVehicles((prev) => {
      const removed = prev.find((v) => v.plate === plate);
      const next = prev.filter((v) => v.plate !== plate);
      if (removed?.isMainBike && next.length > 0 && !next.some((v) => v.isMainBike)) {
        return next.map((v, i) => ({ ...v, isMainBike: i === 0 }));
      }
      return next;
    });
    if (editingPlate === plate) cancelEdit();
  };

  const setMainBike = (targetPlate: string) => {
    if (targetPlate.startsWith("new-")) return;
    setVehicles((prev) => prev.map((v) => ({ ...v, isMainBike: v.plate === targetPlate })));
  };

  const addVehicle = () => {
    if (editingPlate?.startsWith("new-")) {
      if (!isNewVehicleFormValid()) {
        const plateErr = validatePlateParts(editingPlateFormat, editingEmbossed, editingTraditional);
        setValidationErrors({
          company: editingCompany.trim() === "" ? REQUIRED_MSG : "",
          model: editingModel.trim() === "" ? REQUIRED_MSG : "",
          licensePlate:
            plateErr || (composedPlate() === "" ? REQUIRED_MSG : ""),
        });
        return;
      }
      setValidationErrors(null);
      const payload = buildVehiclePayload();
      setVehicles((prev) =>
        prev.map((v) => (v.plate === editingPlate ? { ...v, ...payload, isMainBike: v.isMainBike } : v))
      );
    }
    const tempId = `new-${Date.now()}`;
    const newVehicle: Vehicle = {
      company: "",
      model: "",
      plate: tempId,
      color: "",
      plateFormat: "embossed",
      isMainBike: false,
      embossed: emptyEmbossed(),
    };
    setVehicles((prev) => [...prev, newVehicle]);
    startEdit(newVehicle);
  };

  return (
    <section className="w-full py-6 sm:py-8 px-2 sm:px-0">
      <div className="border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-[5rem_3rem_1fr_1fr_1fr_1fr_auto] sm:items-center gap-4 sm:gap-6 py-3 sm:py-4 border-b border-gray-200">
          <span className="text-[#1a1a1a] font-semibold text-[12px] sm:text-sm text-center leading-tight self-center">
            Main bike
          </span>
          <span className="text-[#1a1a1a] font-semibold text-[15px] sm:text-base text-center">No.</span>
          <span className="text-[#1a1a1a] font-semibold text-[15px] sm:text-base text-left">Company</span>
          <span className="text-[#1a1a1a] font-semibold text-[15px] sm:text-base text-center">Model</span>
          <span className="text-[#1a1a1a] font-semibold text-[15px] sm:text-base text-center">License plate</span>
          <span className="text-[#1a1a1a] font-semibold text-[15px] sm:text-base text-center">Color</span>
          <button
            type="button"
            onClick={addVehicle}
            className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-95 transition-opacity cursor-pointer justify-self-center"
          >
            Add Vehicle
          </button>
        </div>

        {vehicles.map((v, rowIndex) => {
          const { company, model, plate, color } = v;
          const isEditing = editingPlate === plate;
          return (
            <div key={plate} className="border-b border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-[5rem_3rem_1fr_1fr_1fr_1fr_auto] sm:items-start gap-4 sm:gap-6 py-3 sm:py-4">
                <div className="flex items-center justify-center sm:pt-2">
                  <button
                    type="button"
                    disabled={plate.startsWith("new-")}
                    onClick={() => setMainBike(plate)}
                    aria-label={
                      v.isMainBike
                        ? "Main bike selected"
                        : plate.startsWith("new-")
                          ? "Save vehicle first to select as main bike"
                          : "Select as main bike"
                    }
                    aria-pressed={v.isMainBike}
                    title={
                      plate.startsWith("new-")
                        ? "Save this vehicle first"
                        : v.isMainBike
                          ? "Main bike"
                          : "Set as main bike"
                    }
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 ${
                      v.isMainBike
                        ? "border-primary"
                        : "border-gray-400 hover:border-primary"
                    }`}
                  >
                    {v.isMainBike && <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />}
                  </button>
                </div>
                <div className="flex items-center justify-center sm:justify-center sm:pt-2">
                  <span className="text-gray-600 font-semibold tabular-nums text-[15px] sm:text-base min-w-6 text-center">
                    {rowIndex + 1}
                  </span>
                </div>
                <div className="flex flex-col items-start justify-center gap-0.5">
                  <div className="flex justify-start w-full">
                    {isEditing ? (
                      <Combobox
                        value={editingCompany}
                        onChange={setEditingCompany}
                        options={COMPANIES}
                        placeholder="Company name"
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-left text-[15px] sm:text-base focus:outline-none focus:border-primary"
                        autoFocus
                        align="left"
                      />
                    ) : (
                      <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base text-left">{company}</span>
                    )}
                  </div>
                  {isEditing && plate.startsWith("new-") && validationErrors?.company && (
                    <p className="text-red-600 text-xs sm:text-sm text-left mt-0.5" role="alert">
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
                      <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base text-center">{model}</span>
                    )}
                  </div>
                  {isEditing && plate.startsWith("new-") && validationErrors?.model && (
                    <p className="text-red-600 text-xs sm:text-sm text-center mt-0.5" role="alert">
                      {validationErrors.model}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center gap-1 min-h-8">
                  {!isEditing && !plate.startsWith("new-") && (
                    <div className="flex flex-col items-center gap-1 w-full">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          v.plateFormat === "embossed"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {v.plateFormat === "embossed" ? "Embossed" : "Traditional"}
                      </span>
                      <span
                        className="text-center text-[#1a1a1a] font-medium text-sm sm:text-[15px] wrap-break-word max-w-[200px]"
                        style={v.plateFormat === "traditional" ? devanagariStack : undefined}
                      >
                        {formatDisplayPlate(v)}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <span className="text-xs text-gray-500 text-center">Configure below</span>
                  )}
                  {!isEditing && plate.startsWith("new-") && (
                    <span className="text-gray-400 text-sm text-center">—</span>
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
                    <span className="text-center text-gray-500 text-[15px] sm:text-base">{color}</span>
                  )}
                </div>

                <div className="flex gap-3 sm:gap-4 justify-center sm:justify-center flex-wrap">
                  <button
                    type="button"
                    onClick={() => (isEditing ? saveEdit() : startEdit(v))}
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

              {isEditing && (
                <div className="pb-6 pt-1 px-0 sm:px-1">
                  <div className="rounded-2xl border border-gray-200 bg-linear-to-b from-gray-50/80 to-white p-4 sm:p-6 space-y-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#1a1a1a]">Nepal license plate format</h3>
                      <p className="text-xs text-gray-500 max-w-xl">
                        Embossed plates follow the current provincial design; traditional red plates use Devanagari script
                        (older vehicles may still display this style).
                      </p>
                    </div>

                    <PlateFormatPicker value={editingPlateFormat} onChange={setEditingPlateFormat} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      <div className="space-y-4">
                        {editingPlateFormat === "embossed" ? (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Province</label>
                              <select
                                value={editingEmbossed.province}
                                onChange={(e) => setEditingEmbossed((p) => ({ ...p, province: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#1a1a1a] bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                              >
                                <option value="">Select province</option>
                                {NEPAL_PROVINCES.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Category (1 letter)</label>
                                <input
                                  type="text"
                                  maxLength={1}
                                  value={editingEmbossed.category}
                                  onChange={(e) =>
                                    setEditingEmbossed((p) => ({ ...p, category: e.target.value.toUpperCase() }))
                                  }
                                  placeholder="B"
                                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm uppercase text-center focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Lot</label>
                                <input
                                  type="text"
                                  maxLength={2}
                                  value={editingEmbossed.lot}
                                  onChange={(e) =>
                                    setEditingEmbossed((p) => ({
                                      ...p,
                                      lot: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                                    }))
                                  }
                                  placeholder="AB"
                                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm uppercase text-center focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">4 digits</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={4}
                                  value={editingEmbossed.digits}
                                  onChange={(e) =>
                                    setEditingEmbossed((p) => ({
                                      ...p,
                                      digits: e.target.value.replace(/\D/g, "").slice(0, 4),
                                    }))
                                  }
                                  placeholder="0123"
                                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-center tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Zone (Devanagari)</label>
                              <select
                                value={editingTraditional.zone}
                                onChange={(e) => setEditingTraditional((p) => ({ ...p, zone: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                                style={devanagariStack}
                              >
                                <option value="">Select zone</option>
                                {TRADITIONAL_ZONES.map((z) => (
                                  <option key={z.dev} value={z.dev}>
                                    {z.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Lot (1–2 digits)</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={2}
                                  value={editingTraditional.lot}
                                  onChange={(e) =>
                                    setEditingTraditional((p) => ({
                                      ...p,
                                      lot: e.target.value.replace(/\D/g, "").slice(0, 2),
                                    }))
                                  }
                                  placeholder="12"
                                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-center tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                                <select
                                  value={editingTraditional.category}
                                  onChange={(e) =>
                                    setEditingTraditional((p) => ({ ...p, category: e.target.value }))
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                                  style={devanagariStack}
                                >
                                  <option value="">Select</option>
                                  {TRADITIONAL_CATEGORIES.map((c) => (
                                    <option key={c.dev} value={c.dev}>
                                      {c.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Registration (4 digits, shown in Devanagari on plate)
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                value={editingTraditional.digits}
                                onChange={(e) =>
                                  setEditingTraditional((p) => ({
                                    ...p,
                                    digits: e.target.value.replace(/\D/g, "").slice(0, 4),
                                  }))
                                }
                                placeholder="1234"
                                className="w-full max-w-[120px] border border-gray-300 rounded-lg px-2 py-2 text-sm text-center tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">Live preview</p>
                        {editingPlateFormat === "embossed" ? (
                          <LiveEmbossedPreview e={editingEmbossed} />
                        ) : (
                          <LiveTraditionalPreview t={editingTraditional} />
                        )}
                      </div>
                    </div>

                    {validationErrors?.licensePlate && (
                      <p className="text-red-600 text-sm" role="alert">
                        {validationErrors.licensePlate}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Vehiclesform;

