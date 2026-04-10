import {
  HiOutlineCog,
  HiOutlineWrench,
  HiOutlineSparkles,
  HiOutlinePaintBrush,
} from "react-icons/hi2";

export const workshopServices = [
  { id: "service", title: "Service Work", description: "Motorbike care, servicing", Icon: HiOutlineCog },
  { id: "tyre", title: "Tyre Repair", description: "Tyre fitting service", Icon: HiOutlineWrench },
  { id: "wash", title: "Bike Wash", description: "Premium washing & deep cleaning", Icon: HiOutlineSparkles },
  { id: "engine", title: "Engine Repair", description: "Engine diagnostics & repair", Icon: HiOutlineCog },
  { id: "dent", title: "Dent & painting", description: "Dent repair & paint", Icon: HiOutlinePaintBrush },
  { id: "modify", title: "Modify bike", description: "Tuning & modifications", Icon: HiOutlineWrench },
] as const;

export const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

/** Saved bikes for booking (required selection) — replace with profile/API when available */
export const workshopBikes = [
  { id: "bike-1", label: "Honda CB 350 — BA 01 1234" },
  { id: "bike-2", label: "Yamaha R15 — BA 02 5678" },
  { id: "bike-3", label: "Royal Enfield Classic 350 — BA 03 9012" },
] as const;
