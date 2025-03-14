"use client";

import Navbar from "@/components/navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([
    { id: 1, company: "COMPANY-1", details: "Software Engineer" },
    { id: 2, company: "COMPANY-2", details: "Product Manager" },
    { id: 3, company: "COMPANY-3", details: "UX Designer" },
  ]);
  const router = useRouter();

  // Validate user type on load
  useEffect(() => {
    const validateUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, redirecting to login");
        router.push("/");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await res.json();
        console.log("User profile:", user);
        if (user.userType !== "recruiter") {
          console.log("Not a recruiter, redirecting to candidate dashboard");
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Error validating user:", err);
        router.push("/");
      }
    };
    validateUser();
  }, [router]);

  const handleEdit = (jobId: number) => {
    // TODO: Replace with navigation to edit page or modal
    alert(`Editing job for ${jobs.find((j) => j.id === jobId)?.company}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#373737]">
      <Navbar userType="recruiter" />
      <main className="flex-1 p-6">
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-3xl font-semibold text-center uppercase text-white tracking-wide">
            Recruiter Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="job-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="font-semibold text-lg mb-2">{job.company}</h3>
              <p className="text-sm">{job.details}</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleEdit(job.id)}
                  className="bg-[#313131] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#4a4a4a] transition duration-200"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-around gap-4">
          <Link href="/recruiter/post-job">
            <button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">
              Post Job
            </button>
          </Link>
          <Link href="/recruiter/track-applicants">
            <button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">
              Track Applicants
            </button>
          </Link>
          <Link href="/recruiter/analytics">
            <button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">
              AI Analytics
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}