import { useState } from "react";
import { HiEye, HiEyeSlash } from "react-icons/hi2";

const Securityform = () => {
  const [email, setEmail] = useState("nivesh@gmail.com.com");
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const startEditEmail = () => {
    setEmailInput(email);
    setEditingEmail(true);
  };

  const saveEmail = () => {
    setEmail(emailInput.trim() || email);
    setEditingEmail(false);
    setEmailInput("");
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEmail();
    }
  };

  return (
    <section className="w-full py-6 sm:py-8 px-2 sm:px-0">
      <div className="border-t border-gray-200">
        {/* Email row – Edit / Save, Enter to save */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200">
          <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base w-full sm:w-32 sm:min-w-32 shrink-0">
            Email
          </span>
          <div className="flex-1 flex justify-center min-w-0 pr-10">
            {editingEmail ? (
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                placeholder="Enter email"
                className="w-full max-w-md bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
                autoFocus
              />
            ) : (
              <span className="text-center text-gray-500 text-[15px] sm:text-base truncate block w-full">
                {email}
              </span>
            )}
          </div>
          <div className="w-20 sm:w-24 shrink-0 flex justify-end">
            <button
              type="button"
              onClick={editingEmail ? saveEmail : startEditEmail}
              className="text-primary text-sm font-medium hover:underline cursor-pointer"
            >
              {editingEmail ? "Save" : "Edit"}
            </button>
          </div>
        </div>

        {/* Change Password row – click Change to open form */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200">
          <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base w-full sm:w-32 sm:min-w-32 shrink-0 whitespace-nowrap">
            Change Password
          </span>
          <div className="flex-1 flex justify-center min-w-0" />
          <div className="w-20 sm:w-24 shrink-0 flex justify-end">
            <button
              type="button"
              onClick={() => setShowPasswordForm((prev) => !prev)}
              className="text-primary text-sm font-medium hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        {/* Expanded password form – rows with label | input | same style */}
        {showPasswordForm && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200">
              <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base w-full sm:w-32 sm:min-w-32 shrink-0">
                Current Password
              </span>
              <div className="flex-1 relative min-w-0 flex items-center">
                <input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  className="w-full min-w-0 bg-transparent border-0 border-b border-gray-200 py-2.5 pl-0 pr-10 text-[#1a1a1a] text-center placeholder:text-center placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors text-[15px] sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#1a1a1a] focus:outline-none cursor-pointer"
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              <span className="w-20 sm:w-24 shrink-0" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200">
              <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base w-full sm:w-32 sm:min-w-32 shrink-0">
                New Password
              </span>
              <div className="flex-1 relative min-w-0 flex items-center">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full min-w-0 bg-transparent border-0 border-b border-gray-200 py-2.5 pl-0 pr-10 text-[#1a1a1a] text-center placeholder:text-center placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors text-[15px] sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#1a1a1a] focus:outline-none cursor-pointer"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              <span className="w-20 sm:w-24 shrink-0" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200">
              <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base w-full sm:w-32 sm:min-w-32 shrink-0">
                Confirm Password
              </span>
              <div className="flex-1 relative min-w-0 flex items-center">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full min-w-0 bg-transparent border-0 border-b border-gray-200 py-2.5 pl-0 pr-10 text-[#1a1a1a] text-center placeholder:text-center placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors text-[15px] sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#1a1a1a] focus:outline-none cursor-pointer"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              <span className="w-20 sm:w-24 shrink-0" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200">
              <span className="w-full sm:w-32 sm:min-w-32 shrink-0 hidden sm:block" />
              <div className="flex-1 flex flex-wrap gap-3 justify-center min-w-0">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <span className="w-20 sm:w-24 shrink-0" />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Securityform;
