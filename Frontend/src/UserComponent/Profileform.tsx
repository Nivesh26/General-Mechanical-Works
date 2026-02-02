import { useState } from "react";

interface ProfileformProps {
  firstName?: string;
  lastName?: string;
  onNameChange?: (firstName: string, lastName: string) => void;
}

const PHONE_REGEX = /^[\d\s\-+()]{10,15}$/;

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
    default:
      return "";
  }
}

const Profileform = ({ firstName = "Nivesh", lastName = "Shrestha", onNameChange }: ProfileformProps) => {
  const initialFields = [
    { label: "First Name", value: firstName },
    { label: "Last Name", value: lastName },
    { label: "Phone Number", value: "9849925333" },
    { label: "Date of Birth", value: "2004 - 02 - 2" },
    { label: "Gender", value: "Male" },
    { label: "Location", value: "Pulchowk, Lalitpur, Nepal" },
  ];

  const [fields, setFields] = useState(initialFields);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [validationError, setValidationError] = useState("");

  const startEdit = (label: string, value: string) => {
    setValidationError("");
    setEditingLabel(label);
    setEditingValue(value);
  };

  const saveEdit = () => {
    if (editingLabel === null) return;
    const error = getValidationError(editingLabel, editingValue);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    const trimmedValue = editingValue.trim();
    const updatedFields = fields.map((f) =>
      f.label === editingLabel ? { ...f, value: trimmedValue } : f
    );
    setFields(updatedFields);

    if (onNameChange && (editingLabel === "First Name" || editingLabel === "Last Name")) {
      const newFirstName = updatedFields.find((f) => f.label === "First Name")?.value ?? "";
      const newLastName = updatedFields.find((f) => f.label === "Last Name")?.value ?? "";
      onNameChange(newFirstName, newLastName);
    }

    setEditingLabel(null);
    setEditingValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
  };

  return (
    <section className="w-full py-6 sm:py-8 px-2 sm:px-0">
      <div className="border-t border-gray-200">
        {fields.map(({ label, value }) => {
          const isEditing = editingLabel === label;
          const showError = isEditing && validationError;
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
                      {value}
                    </span>
                  )}
                </div>
                {showError && (
                  <p className="text-red-600 text-sm text-center w-full mt-0.5" role="alert">
                    {validationError}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  isEditing ? saveEdit() : startEdit(label, value)
                }
                className="text-primary text-sm font-medium hover:underline cursor-pointer shrink-0 w-fit"
              >
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Profileform;
