"use client";

import Navbar from "@/components/navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const checkFirstLogin = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      if (!user.resumeParsed && user.userType === "candidate") {
        showToast("Please upload your resume to complete your profile!");
        setTimeout(() => router.push("/resume-extraction"), 3000);
      }
    };
    checkFirstLogin();
  }, []);

  const handleApply = async (companyId) => {
    setAppliedJobs((prev) => [...prev, companyId]);
    alert(`Applied to COMPANY-${companyId}`);
    // TODO: Replace with API call to /api/applications/apply
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#373737]">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-3xl font-semibold text-center uppercase text-white tracking-wide">
            Get Your Job in One Tap
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((company) => (
            <div
              key={company}
              className="job-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="font-semibold text-lg mb-2">COMPANY-{company}</h3>
              <div className="text-sm text-gray-800">
                <p>All Details</p>
                <p>About</p>
                <p>The Company</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleApply(company)}
                  disabled={appliedJobs.includes(company)}
                  className={`text-sm px-4 py-2 rounded-lg transition duration-200 ${
                    appliedJobs.includes(company)
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-[#313131] text-white hover:bg-[#4a4a4a]"
                  }`}
                >
                  {appliedJobs.includes(company) ? "Applied" : "Apply"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-around gap-4">
          <Link href="/resume-extraction">
            <button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">
              Resume Extraction
            </button>
          </Link>
          <Link href="/track-applications">
            <button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">
              Track Applications
            </button>
          </Link>
          <Link href="/analytics">
            <button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">
              AI Analytics
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}

function showToast(message) {
  window.dispatchEvent(new CustomEvent("show-toast", { detail: message }));
}