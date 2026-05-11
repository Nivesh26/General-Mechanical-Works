import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../UserComponent/Footer";
import Copyright from "../UserComponent/Copyright";
import Header from "../UserComponent/Header";
import Profileform from "../UserComponent/Profileform";
import Profliephotos from "../UserComponent/Profliephotos";
import { initialVehicles } from "../UserComponent/Vehiclesform";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { patchUserProfile, type ProfileUpdatePayload } from "../lib/api";

function splitFullName(fullName: string): { first: string; last: string } {
  const t = fullName.trim();
  if (!t) return { first: "User", last: "" };
  const i = t.indexOf(" ");
  if (i === -1) return { first: t, last: "" };
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() };
}

const Profile = () => {
  const { user, loading, logout, token, refreshUser, replaceToken } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true, state: { from: "/profile" } });
    }
  }, [loading, user, navigate]);

  const profileFields = useMemo(() => {
    if (!user) {
      return {
        firstName: "",
        lastName: "",
        phone: "",
        dateOfBirthIso: null,
        gender: null,
        location: null,
      };
    }
    const { first, last } = splitFullName(user.name);
    return {
      firstName: first,
      lastName: last,
      phone: user.phone ?? "",
      dateOfBirthIso: user.dateOfBirth ?? null,
      gender: user.gender ?? null,
      location: user.location ?? null,
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const { first, last } = splitFullName(user.name);
    setFirstName(first);
    setLastName(last);
  }, [user]);

  const handleNameChange = (newFirstName: string, newLastName: string) => {
    setFirstName(newFirstName);
    setLastName(newLastName);
  };

  const handleLogout = () => {
    toast.error("You have been logged out.");
    logout();
    navigate("/login", { replace: true });
  };

  const handlePersist = async (patch: ProfileUpdatePayload) => {
    if (!token) return;
    const { accessToken } = await patchUserProfile(token, patch);
    if (accessToken) replaceToken(accessToken);
    await refreshUser();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-600">
          Loading profile…
        </div>
        <Footer />
        <Copyright />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <Header />

      <div className="mx-[80px]">
        <Profliephotos
          firstName={firstName}
          lastName={lastName}
          vehicles={initialVehicles}
        />
        <Profileform
          profile={profileFields}
          onNameChange={handleNameChange}
          onPersist={handlePersist}
        />

        <div className="flex justify-end pt-8 pb-4 border-t border-gray-200 mt-8">
          <button
            type="button"
            onClick={handleLogout}
            className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      <Footer />
      <Copyright />
    </div>
  );
};

export default Profile;
