"use client";

import Navbar from "@/components/navbar";
import { useState } from "react";

export default function Jobs() {
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [filter, setFilter] = useState("");

  const jobs = [
    { id: 1, company: "COMPANY-1", details: "Software Engineer", skills: ["React", "Node.js"] },
    { id: 2, company: "COMPANY-2", details: "Product Manager", skills: ["Agile", "UX"] },
    { id: 3, company: "COMPANY-3", details: "UX Designer", skills: ["Figma", "UI"] },
  ];

  const handleApply = (jobId: number) => {
    setAppliedJobs((prev) => [...prev, jobId]);
    alert(`Applied to ${jobs.find((j) => j.id === jobId)?.company}`);
  };

  const filteredJobs = jobs.filter((job) =>
    job.company.toLowerCase().includes(filter.toLowerCase()) ||
    job.details.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#373737]">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-3xl font-semibold text-center uppercase text-white tracking-wide">Jobs</h1>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search jobs by company or title..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#d9d9d9] text-[#313131] border border-[#4f4d4d] focus:outline-none focus:ring-2 focus:ring-[#313131]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="job-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="font-semibold text-lg mb-2">{job.company}</h3>
              <p className="text-sm">{job.details}</p>
              <p className="text-xs text-gray-600 mt-1">Skills: {job.skills.join(", ")}</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleApply(job.id)}
                  disabled={appliedJobs.includes(job.id)}
                  className={`text-sm px-4 py-2 rounded-lg transition duration-200 ${
                    appliedJobs.includes(job.id)
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-[#313131] text-white hover:bg-[#4a4a4a]"
                  }`}
                >
                  {appliedJobs.includes(job.id) ? "Applied" : "Apply"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}