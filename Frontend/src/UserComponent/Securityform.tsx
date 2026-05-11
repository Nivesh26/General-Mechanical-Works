import { useEffect, useState } from "react";
import { HiEye, HiEyeSlash } from "react-icons/hi2";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { changePassword, patchUserProfile } from "../lib/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Securityform = () => {
  const { token, user, refreshUser, replaceToken } = useAuth();
  const [email, setEmail] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [passwordFormError, setPasswordFormError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const startEditEmail = () => {
    setEmailError("");
    setEmailInput(email);
    setEditingEmail(true);
  };

  const saveEmail = async () => {
    const trimmed = emailInput.trim();
    if (trimmed.length === 0) {
      setEmailError("Email is required.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (!token) {
      toast.error("You must be signed in to update email.");
      return;
    }
    if (trimmed.toLowerCase() === email.toLowerCase()) {
      setEmailError("");
      setEditingEmail(false);
      setEmailInput("");
      return;
    }
    setEmailError("");
    setSavingEmail(true);
    try {
      const { profile, accessToken } = await patchUserProfile(token, { email: trimmed });
      if (accessToken) replaceToken(accessToken);
      await refreshUser();
      setEmail(profile.email);
      setEditingEmail(false);
      setEmailInput("");
      toast.success("Email updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update email.");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void saveEmail();
    }
  };

  const validatePasswordForm = (): string => {
    if (!currentPwd) return "Current password is required.";
    if (!newPwd) return "New password is required.";
    if (newPwd.length < 8) return "New password must be at least 8 characters.";
    if (newPwd.length > 128) return "New password must be at most 128 characters.";
    if (newPwd === currentPwd) return "New password must be different from your current password.";
    if (!confirmPwd) return "Please confirm your new password.";
    if (confirmPwd !== newPwd) return "New password and confirmation do not match.";
    return "";
  };

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFormError("");
    const err = validatePasswordForm();
    if (err) {
      setPasswordFormError(err);
      return;
    }
    if (!token) {
      toast.error("You must be signed in to change your password.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(token, { currentPassword: currentPwd, newPassword: newPwd });
      toast.success("Password updated.");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setShowPasswordForm(false);
    } catch (ex) {
      toast.error(ex instanceof Error ? ex.message : "Could not change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const cancelPasswordForm = () => {
    setPasswordFormError("");
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setShowPasswordForm(false);
  };

  return (
    <section className="w-full py-6 sm:py-8 px-2 sm:px-0">
      <div className="border-t border-gray-200">
        {/* Email row – Edit / Save, Enter to save */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200">
          <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base w-full sm:w-32 sm:min-w-32 shrink-0">
            Email
          </span>
          <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0 pr-10">
            <div className="w-full flex justify-center">
              {editingEmail ? (
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="Enter email"
                  className="w-full max-w-md bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-[#1a1a1a] text-center text-[15px] sm:text-base focus:outline-none focus:border-primary"
                  autoFocus
                  disabled={savingEmail}
                />
              ) : (
                <span className="text-center text-gray-500 text-[15px] sm:text-base truncate block w-full">
                  {email || "—"}
                </span>
              )}
            </div>
            {emailError && (
              <p className="text-red-600 text-sm text-center w-full mt-0.5" role="alert">
                {emailError}
              </p>
            )}
          </div>
          <div className="w-20 sm:w-24 shrink-0 flex justify-end">
            <button
              type="button"
              disabled={savingEmail}
              onClick={() => void (editingEmail ? saveEmail() : startEditEmail())}
              className="text-primary text-sm font-medium hover:underline cursor-pointer disabled:opacity-50"
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
          <form onSubmit={(e) => void submitPasswordChange(e)} noValidate>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200">
              <span className="text-[#1a1a1a] font-medium text-[15px] sm:text-base w-full sm:w-32 sm:min-w-32 shrink-0">
                Current Password
              </span>
              <div className="flex-1 relative min-w-0 flex items-center">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPwd}
                  onChange={(e) => {
                    setCurrentPwd(e.target.value);
                    setPasswordFormError("");
                  }}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  disabled={savingPassword}
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
                  value={newPwd}
                  onChange={(e) => {
                    setNewPwd(e.target.value);
                    setPasswordFormError("");
                  }}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={savingPassword}
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
                  value={confirmPwd}
                  onChange={(e) => {
                    setConfirmPwd(e.target.value);
                    setPasswordFormError("");
                  }}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={savingPassword}
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
            {passwordFormError ? (
              <p className="text-red-600 text-sm text-center py-2" role="alert">
                {passwordFormError}
              </p>
            ) : null}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200">
              <span className="w-full sm:w-32 sm:min-w-32 shrink-0 hidden sm:block" />
              <div className="flex-1 flex flex-wrap gap-3 justify-center min-w-0">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  {savingPassword ? "Saving…" : "Change Password"}
                </button>
                <button
                  type="button"
                  disabled={savingPassword}
                  onClick={cancelPasswordForm}
                  className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
              <span className="w-20 sm:w-24 shrink-0" />
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default Securityform;
