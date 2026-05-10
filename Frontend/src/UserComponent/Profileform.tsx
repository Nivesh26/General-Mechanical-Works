import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { ProfileGender, ProfileUpdatePayload } from "../lib/api";

export type ProfileFieldSource = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirthIso: string | null;
  gender: ProfileGender | null;
  location: string | null;
};

interface ProfileformProps {
  profile: ProfileFieldSource;
  onNameChange?: (firstName: string, lastName: string) => void;
  onPersist?: (patch: ProfileUpdatePayload) => Promise<void>;
}

const PHONE_REGEX = /^[\d\s\-+()]{10,15}$/;
const MAX_LOCATION = 500;

function formatDobDisplay(isoOrDash: string): string {
  if (!isoOrDash || isoOrDash === "—") return "—";
  const [y, m, d] = isoOrDash.split("-");
  if (!y || !m || !d) return isoOrDash;
  return `${d}/${m}/${y}`;
}

function genderDisplay(g: ProfileGender | null): string {
  if (g === "MALE") return "Male";
  if (g === "FEMALE") return "Female";
  return "—";
}

type FieldRow = { label: string; value: string };

function buildFields(source: ProfileFieldSource): FieldRow[] {
  const dobStore = source.dateOfBirthIso ?? "—";
  return [
    { label: "First Name", value: source.firstName },
    { label: "Last Name", value: source.lastName },
    { label: "Email", value: source.email },
    { label: "Phone Number", value: source.phone },
    { label: "Date of Birth", value: dobStore },
    { label: "Gender", value: genderDisplay(source.gender) },
    { label: "Location", value: source.location?.trim() ? source.location.trim() : "—" },
  ];
}

function getValidationError(label: string, value: string): string {
  const trimmed = value.trim();
  switch (label) {
    case "First Name":
      return trimmed.length === 0 ? "First name is required." : "";
    case "Last Name":
      return trimmed.length === 0 ? "Last name is required." : "";
    case "Phone Number":
      if (trimmed.length === 0) return "Phone number is required.";
      if (!PHONE_REGEX.test(trimmed) || trimmed.replace(/\D/g, "").length < 10) {
        return "Please enter a valid phone number (at least 10 digits).";
      }
      return "";
    case "Location":
      if (trimmed === "" || trimmed === "—") return "";
      if (trimmed.length > MAX_LOCATION) return `Use at most ${MAX_LOCATION} characters.`;
      return "";
    case "Date of Birth":
      if (!trimmed || trimmed === "—") return "Pick a date or cancel.";
      return "";
    default:
      return "";
  }
}

function buildPatch(editingLabel: string | null, rows: FieldRow[]): ProfileUpdatePayload {
  if (!editingLabel) return {};
  const get = (l: string) => rows.find((r) => r.label === l)?.value?.trim() ?? "";

  if (editingLabel === "First Name" || editingLabel === "Last Name") {
    const name = `${get("First Name")} ${get("Last Name")}`.trim();
    return name ? { name } : {};
  }
  if (editingLabel === "Phone Number") {
    return { phone: get("Phone Number") };
  }
  if (editingLabel === "Date of Birth") {
    const raw = get("Date of Birth");
    if (!raw || raw === "—") return {};
    return { dateOfBirth: raw };
  }
  if (editingLabel === "Gender") {
    const g = get("Gender");
    return { gender: g === "Male" ? "MALE" : "FEMALE" };
  }
  if (editingLabel === "Location") {
    const loc = get("Location");
    if (!loc || loc === "—") return { location: "" };
    return { location: loc };
  }
  return {};
}

const Profileform = ({ profile, onNameChange, onPersist }: ProfileformProps) => {
  const [fields, setFields] = useState<FieldRow[]>(() => buildFields(profile));
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFields(buildFields(profile));
    setEditingLabel(null);
    setEditingValue("");
    setValidationError("");
  }, [profile]);

  const startEdit = (label: string, value: string) => {
    if (label === "Email") return;
    setValidationError("");
    setEditingLabel(label);
    if (label === "Date of Birth") {
      setEditingValue(value === "—" ? "" : value);
    } else if (label === "Location") {
      setEditingValue(value === "—" ? "" : value);
    } else if (label === "Gender") {
      setEditingValue(value === "—" ? "Male" : value);
    } else {
      setEditingValue(value);
    }
  };

  const saveEdit = async () => {
    if (editingLabel === null) return;
    const error = getValidationError(editingLabel, editingValue);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");

    const trimmedValue =
      editingLabel === "Date of Birth" || editingLabel === "Gender"
        ? editingValue
        : editingValue.trim();

    const updatedFields = fields.map((f) =>
      f.label === editingLabel ? { ...f, value: trimmedValue } : f,
    );
    setFields(updatedFields);

    if (onNameChange && (editingLabel === "First Name" || editingLabel === "Last Name")) {
      const newFirstName = updatedFields.find((f) => f.label === "First Name")?.value ?? "";
      const newLastName = updatedFields.find((f) => f.label === "Last Name")?.value ?? "";
      onNameChange(newFirstName, newLastName);
    }

    const patch = buildPatch(editingLabel, updatedFields);
    setEditingLabel(null);
    setEditingValue("");

    if (onPersist && Object.keys(patch).length > 0) {
      setSaving(true);
      try {
        await onPersist(patch);
        toast.success("Profile updated.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save changes.");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void saveEdit();
    }
  };

  return (
    <section className="w-full py-6 sm:py-8 px-2 sm:px-0">
      <div className="border-t border-gray-200">
        {fields.map(({ label, value }) => {
          const readOnly = label === "Email";
          const isEditing = editingLabel === label;
          const showError = isEditing && validationError;
          const displayText =
            label === "Date of Birth" && !isEditing ? formatDobDisplay(value) : value;

          return (
            <div
              key={label}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200 first:border-t-0"
            >
              <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base w-full sm:w-32 sm:min-w-32 shrink-0">
                {label}
              </span>
              <div className="flex-1 w-full min-w-0 flex flex-col items-center gap-0.5">
                <div className="w-full flex justify-center sm:justify-center">
                  {isEditing ? (
                    label === "Gender" ? (
                      <select
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full max-w-md bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary cursor-pointer"
                        autoFocus
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    ) : label === "Date of Birth" ? (
                      <input
                        type="date"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full max-w-md bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
                        autoFocus
                      />
                    ) : (
                      <input
                        type={label === "Phone Number" ? "tel" : "text"}
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full max-w-md bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
                        autoFocus
                        placeholder={label === "Phone Number" ? "Phone Number" : undefined}
                      />
                    )
                  ) : (
                    <span className="text-center text-gray-500 text-[15px] sm:text-base min-w-0 truncate block w-full">
                      {displayText}
                    </span>
                  )}
                </div>
                {showError && (
                  <p className="text-red-600 text-sm text-center w-full mt-0.5" role="alert">
                    {validationError}
                  </p>
                )}
              </div>
              {readOnly ? (
                <span className="shrink-0 w-10 sm:w-12" aria-hidden />
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void (isEditing ? saveEdit() : startEdit(label, value))}
                  className="text-primary text-sm font-medium hover:underline cursor-pointer shrink-0 w-fit disabled:opacity-50"
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Profileform;
