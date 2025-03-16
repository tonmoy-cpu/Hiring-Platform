"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Sidebar from "./sidebar"; // Import the Sidebar component
import { skillOptions, domainOptions } from "@/lib/utils";

interface NavbarProps {
  userType?: "candidate" | "recruiter";
}

export default function Navbar({ userType = "candidate" }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string>("/uploads/default.jpg");
  const [imageError, setImageError] = useState(false);
  const [showPreferencesPopup, setShowPreferencesPopup] = useState(false);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [preferredDomains, setPreferredDomains] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfilePic(data.profilePic || "/uploads/default.jpg");
        if (userType === "candidate") {
          setPreferredSkills(data.preferredSkills || []);
          setPreferredDomains(data.preferredDomains || []);
        }
      } catch (err) {
        toast.error(`Failed to load profile: ${err.message}`);
        if (err.message.includes("401")) {
          localStorage.removeItem("token");
          router.push("/");
        }
      }
    };
    fetchProfile();
  }, [router, userType]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      router.push("/");
      setIsMenuOpen(false);
      setIsProfileOpen(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!imageError) {
      e.currentTarget.src = "/default.jpg";
      setImageError(true);
    } else {
      e.currentTarget.src = "https://via.placeholder.com/40";
    }
  };

  const handleSkillChange = (skill: string) => {
    setPreferredSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleDomainChange = (domain: string) => {
    setPreferredDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const savePreferences = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferredSkills, preferredDomains }),
      });
      if (!res.ok) throw new Error(`Failed to save preferences: ${res.status}`);
      setShowPreferencesPopup(false);
      toast.success("Preferences saved successfully!");
    } catch (err) {
      toast.error(`Error saving preferences: ${err.message}`);
      if (err.message.includes("401")) {
        localStorage.removeItem("token");
        router.push("/");
      }
    }
  };

  return (
    <>
      <nav className="bg-[#313131] p-4 flex items-center justify-between shadow-md relative z-30">
        <div className="flex items-center">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none mr-4">
            <Menu className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="flex-1 flex justify-center space-x-6 items-center">
          <Link
            href={userType === "recruiter" ? "/recruiter/dashboard" : "/dashboard"}
            className="nav-link text-white hover:text-gray-300"
          >
            Home
          </Link>
          <Link href="/contact" className="nav-link text-white hover:text-gray-300">
            Contact
          </Link>
          <Link href="/about" className="nav-link text-white hover:text-gray-300">
            About
          </Link>
          {userType === "candidate" && (
            <button
              onClick={() => setShowPreferencesPopup(true)}
              className="bg-[#4a4a4a] text-white px-4 py-2 rounded hover:bg-[#5a5a5a] transition"
            >
              Add Preferences
            </button>
          )}
        </div>

        <div className="relative">
          <img
            src={`http://localhost:5000${profilePic}`}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onError={handleImageError}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          />
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 dropdown-menu rounded-md shadow-lg z-30">
              <Link
                href="/profile"
                className="dropdown-item block text-white hover:bg-[#4a4a4a]"
                onClick={() => setIsProfileOpen(false)}
              >
                Profile Details
              </Link>
              <button
                onClick={handleLogout}
                className="dropdown-item block w-full text-left text-white hover:bg-[#4a4a4a]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Render Sidebar here */}
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} userType={userType} />

      {showPreferencesPopup && userType === "candidate" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#d9d9d9] p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#313131] mb-4">Set Your Preferences</h2>
            <div className="mb-4">
              <h3 className="font-bold text-[#313131] mb-2">Skills</h3>
              <div className="grid grid-cols-2 gap-2">
                {skillOptions.map((skill) => (
                  <label key={skill} className="flex items-center text-[#313131]">
                    <input
                      type="checkbox"
                      checked={preferredSkills.includes(skill)}
                      onChange={() => handleSkillChange(skill)}
                      className="mr-2"
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-bold text-[#313131] mb-2">Domains</h3>
              <div className="grid grid-cols-1 gap-2">
                {domainOptions.map((domain) => (
                  <label key={domain} className="flex items-center text-[#313131]">
                    <input
                      type="checkbox"
                      checked={preferredDomains.includes(domain)}
                      onChange={() => handleDomainChange(domain)}
                      className="mr-2"
                    />
                    {domain}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-between space-x-4">
              <button
                onClick={savePreferences}
                className="bg-[#313131] text-white px-6 py-2 rounded-lg hover:bg-[#4a4a4a] transition w-full"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowPreferencesPopup(false)}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}