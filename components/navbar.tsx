"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface NavbarProps {
  userType?: "candidate" | "recruiter";
}

export default function Navbar({ userType = "candidate" }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string>("/uploads/default.jpg");
  const [imageError, setImageError] = useState(false);
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
      } catch (err) {
        toast.error(`Failed to load profile: ${err.message}`);
        if (err.message.includes("401")) {
          localStorage.removeItem("token");
          router.push("/");
        }
      }
    };
    fetchProfile();
  }, [router]);

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

  const menuOptions = userType === "recruiter"
    ? [
        { label: "Dashboard", href: "/recruiter/dashboard" },
        { label: "Post Job", href: "/recruiter/post-job" },
        { label: "Track Applicants", href: "/recruiter/track-applicants" },
        { label: "Contact", href: "/contact" },
        { label: "About", href: "/about" },
      ]
    : [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Resume Extraction", href: "/resume-extraction" },
        { label: "Track Applications", href: "/track-applications" },
        { label: "Contact", href: "/contact" },
        { label: "About", href: "/about" },
      ];

  return (
    <nav className="bg-[#313131] p-4 flex items-center justify-between shadow-md relative z-30">
      <div className="flex items-center">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none mr-4">
          <Menu className="h-6 w-6 text-white" />
        </button>
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-[#313131] shadow-md z-20 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col space-y-4 p-4 mt-16">
            {menuOptions.map((option) => (
              <Link
                key={option.label}
                href={option.href}
                className="nav-link text-white hover:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {option.label}
              </Link>
            ))}
            <Link
              href="/profile"
              className="nav-link text-white hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile Details
            </Link>
            <button
              onClick={handleLogout}
              className="nav-link text-white hover:text-gray-300 text-left"
            >
              Logout
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}
      </div>

      <div className="flex-1 flex justify-center space-x-6">
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
  );
}