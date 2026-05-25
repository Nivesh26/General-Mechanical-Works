import { useRef, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import type { Vehicle } from "./Vehiclesform";

type ActiveTab = "profile" | "vehicles" | "security";

interface ProfliphotosProps {
  activeTab?: ActiveTab;
  firstName?: string;
  lastName?: string;
  vehicles?: Vehicle[];
  /** While vehicles are loading from the API */
  vehiclesLoading?: boolean;
  /** Blob URL from authenticated GET /api/auth/me/avatar */
  avatarObjectUrl?: string | null;
  /** Single letter when no custom photo */
  displayLetter?: string;
  /** Server says user has a stored image (show Delete) */
  hasAvatar?: boolean;
  onAvatarFile?: (file: File) => void;
  onAvatarDelete?: () => void;
  avatarBusy?: boolean;
  coverObjectUrl?: string | null;
  hasCoverPhoto?: boolean;
  onCoverFile?: (file: File) => void;
  onCoverDelete?: () => void;
  coverBusy?: boolean;
}

function letterFromName(firstName: string, lastName: string): string {
  const f = firstName.trim();
  if (f) return f.charAt(0).toUpperCase();
  const l = lastName.trim();
  if (l) return l.charAt(0).toUpperCase();
  return "U";
}

/** Subtitle under the user name: only the bike marked as main (company + model). */
function mainBikeNameLine(vehicles: Vehicle[], loading: boolean): string {
  if (loading) return "Loading…";
  const saved = vehicles.filter(
    (v) => !v.plate.startsWith("new-") && (v.company.trim() || v.model.trim())
  );
  const main = saved.find((v) => v.isMainBike);
  if (main) {
    const name = [main.company, main.model].filter((s) => s.trim()).join(" ").trim();
    if (name) return name;
  }
  if (saved.length === 0) return "No bike added";
  return "Select your main bike";
}

const Profliephotos = ({
  activeTab = "profile",
  firstName = "",
  lastName = "",
  vehicles = [],
  vehiclesLoading = false,
  avatarObjectUrl = null,
  displayLetter,
  hasAvatar = false,
  onAvatarFile,
  onAvatarDelete,
  avatarBusy = false,
  coverObjectUrl = null,
  hasCoverPhoto = false,
  onCoverFile,
  onCoverDelete,
  coverBusy = false,
}: ProfliphotosProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const vehicleLabel = mainBikeNameLine(vehicles, vehiclesLoading);
  const letter = displayLetter ?? letterFromName(firstName, lastName);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onAvatarFile) return;
    if (!file.type.startsWith("image/")) return;
    void onAvatarFile(file);
  };

  const onCoverFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onCoverFile) return;
    if (!file.type.startsWith("image/")) return;
    void onCoverFile(file);
  };

  return (
    <section className="w-full pt-8 pb-4">
      <input
        ref={coverFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        aria-hidden
        onChange={onCoverFileChange}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        aria-hidden
        onChange={onFileChange}
      />
      {/* Cover + Upload button; only profile photo in front */}
      <div className="relative rounded-t-2xl overflow-visible h-[200px] sm:h-[240px]">
        <div
          className="absolute inset-0 rounded-t-2xl overflow-hidden"
          style={{
            ...(coverObjectUrl
              ? {
                  backgroundImage: `url(${coverObjectUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  background:
                    "linear-gradient(135deg, #bd162c 0%, #8b1a2a 35%, #6b1520 60%, #a01d28 80%, #4a1018 100%)",
                }),
          }}
        />
        {!coverObjectUrl ? (
          <div
            className="absolute inset-0 rounded-t-2xl opacity-50"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 70% 50% at 30% 40%, rgba(220,60,60,0.35), transparent 50%),
                radial-gradient(ellipse 50% 70% at 70% 60%, rgba(120,25,25,0.3), transparent 55%)
              `,
            }}
          />
        ) : null}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
          {hasCoverPhoto && onCoverDelete ? (
            <button
              type="button"
              disabled={coverBusy}
              onClick={() => void onCoverDelete()}
              className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium border border-gray-200 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              Remove Cover
            </button>
          ) : null}
          <button
            type="button"
            disabled={coverBusy || !onCoverFile}
            onClick={() => coverFileRef.current?.click()}
            className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium border border-gray-200 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
          >
            Upload Cover
          </button>
        </div>
        <div className="absolute left-[70px] bottom-0 z-10 translate-y-1/2">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[28px] overflow-hidden border-4 border-white shadow-md bg-gray-100">
            {avatarObjectUrl ? (
              <img
                src={avatarObjectUrl}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center bg-slate-200 text-primary text-4xl sm:text-5xl font-bold select-none"
                aria-hidden
              >
                {letter}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 pt-16 sm:pt-20 pl-[70px] sm:pl-[70px] pr-0 sm:pr-2">
        <div className="flex flex-wrap items-end gap-4 sm:gap-6">
          <div className="w-32 sm:w-36 shrink-0 flex flex-col items-start">
            <div className="flex gap-10 ">
              <button
                type="button"
                disabled={avatarBusy || !onAvatarFile}
                onClick={() => fileRef.current?.click()}
                className="text-primary text-sm font-medium underline cursor-pointer disabled:opacity-50 disabled:no-underline"
              >
                Change
              </button>
              <button
                type="button"
                disabled={avatarBusy || !hasAvatar || !onAvatarDelete}
                onClick={() => void onAvatarDelete?.()}
                className="text-primary text-sm font-medium underline cursor-pointer disabled:opacity-40 disabled:no-underline"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="pb-10 -mt-24 sm:-mt-25">
            <h1 className="text-primary font-bold text-xl sm:text-2xl">
              {firstName} {lastName}
            </h1>
            <p className="text-black text-sm sm:text-base mt-0.5 font-normal">
              {vehicleLabel}
            </p>
          </div>
        </div>

        <div className="flex gap-6 sm:gap-8 pb-3 border-b border-gray-200 shrink-0">
          <Link
            to="/profile"
            className={`text-black text-sm font-medium uppercase tracking-wide border-b-2 pb-3 -mb-[13px] ${
              activeTab === "profile" ? "border-primary" : "border-gray-300 hover:text-primary hover:border-primary"
            }`}
          >
            Profile
          </Link>
          <Link
            to="/profilevehicles"
            className={`text-black text-sm font-medium uppercase tracking-wide border-b-2 pb-3 -mb-[13px] ${
              activeTab === "vehicles" ? "border-primary" : "border-gray-300 hover:text-primary hover:border-primary"
            }`}
          >
            Vehicles
          </Link>
          <Link
            to="/profilesecurity"
            className={`text-black text-sm font-medium uppercase tracking-wide border-b-2 pb-3 -mb-[13px] ${
              activeTab === "security" ? "border-primary" : "border-gray-300 hover:text-primary hover:border-primary"
            }`}
          >
            Security
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Profliephotos;
