"use client";

import Navbar from "@/components/navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem("token");
      console.log("Recruiter token retrieved:", token);
      if (!token) {
        console.log("No token found, redirecting to login");
        router.push("/");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/jobs/recruiter", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch jobs with status: ${res.status} - ${errorText}`);
        }
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        if (err.message.includes("401")) {
          toast.error("Session expired or invalid token. Please log in again.");
          localStorage.removeItem("token");
          router.push("/");
        } else {
          toast.error("Failed to load jobs: " + err.message);
        }
      }
    };
    fetchJobs();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#373737]">
      <Navbar userType="recruiter" />
      <main className="flex-1 p-6">
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-3xl font-semibold text-center uppercase text-white tracking-wide">
            Your Job Postings
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="p-6 rounded-lg shadow-md bg-[#d9d9d9]"
            >
              <h3 className="font-semibold text-lg mb-2 text-[#313131]">{job.title}</h3>
              <div className="text-sm text-[#313131]">
                <p>{job.details}</p>
                <p>Skills: {job.skills.join(", ")}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}