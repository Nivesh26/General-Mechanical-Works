const Profileform = () => {
  const fields = [
    { label: "First Name", value: "Nivesh" },
    { label: "Last Name", value: "Shrestha" },
    { label: "Email", value: "nivesh@gmail.com" },
    { label: "Phone Number", value: "9849925333" },
    { label: "Date of Birth", value: "2004 - 02 - 2" },
    { label: "Gender", value: "Male" },
    { label: "Location", value: "Pulchowk, Lalitpur, Nepal" },
  ];

  return (
    <section className="w-full py-8">
      {/* Personal info – Edit */}
      <div className="border-t border-gray-200">
        {fields.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center gap-4 py-4 border-b border-gray-200 first:border-t-0"
          >
            <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base w-32 sm:w-40 shrink-0">
              {label}
            </span>
            <span className="flex-1 text-center text-gray-500 text-[15px] sm:text-base min-w-0 truncate">
              {value}
            </span>
            <button
              type="button"
              className="text-primary text-sm font-medium shrink-0 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Profileform;
