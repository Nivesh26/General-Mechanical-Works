import { useState } from "react";

const initialFields = [
  { label: "First Name", value: "Nivesh" },
  { label: "Last Name", value: "Shrestha" },
  { label: "Phone Number", value: "9849925333" },
  { label: "Date of Birth", value: "2004 - 02 - 2" },
  { label: "Gender", value: "Male" },
  { label: "Location", value: "Pulchowk, Lalitpur, Nepal" },
];

const Profileform = () => {
  const [fields, setFields] = useState(initialFields);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const startEdit = (label: string, value: string) => {
    setEditingLabel(label);
    setEditingValue(value);
  };

  const saveEdit = () => {
    if (editingLabel === null) return;
    setFields((prev) =>
      prev.map((f) =>
        f.label === editingLabel ? { ...f, value: editingValue } : f
      )
    );
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
          return (
            <div
              key={label}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200 first:border-t-0"
            >
              <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base w-full sm:w-32 sm:min-w-32 shrink-0">
                {label}
              </span>
              <div className="flex-1 w-full min-w-0 flex justify-center sm:justify-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full max-w-md bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
                    autoFocus
                  />
                ) : (
                  <span className="text-center text-gray-500 text-[15px] sm:text-base min-w-0 truncate block w-full">
                    {value}
                  </span>
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
