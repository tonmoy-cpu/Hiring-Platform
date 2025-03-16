"use client";

import Navbar from "@/components/navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [filter, setFilter] = useState(""); // Text search
  const [skillFilter, setSkillFilter] = useState(""); // Skill filter
  const [minSalary, setMinSalary] = useState(""); // Min salary filter
  const [maxSalary, setMaxSalary] = useState(""); // Max salary filter
  const [statusFilter, setStatusFilter] = useState("open"); // Status filter: "open" or "all"
  const [showApplyModal, setShowApplyModal] = useState(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        // Fetch all jobs, including closed ones if statusFilter is "all"
        const jobsUrl = statusFilter === "all" 
          ? "http://localhost:5000/api/jobs?all=true&includeClosed=true" 
          : "http://localhost:5000/api/jobs?all=true";
        
        const [jobsRes, appsRes] = await Promise.all([
          fetch(jobsUrl, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }),
          fetch("http://localhost:5000/api/applications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!jobsRes.ok) throw new Error(`Jobs fetch failed: ${jobsRes.status}`);
        if (!appsRes.ok) throw new Error(`Applications fetch failed: ${appsRes.status}`);

        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();

        console.log("Fetched jobs for /jobs:", jobsData.length, "Jobs:", jobsData.map(j => j.title));
        setJobs(jobsData);
        setAppliedJobs(appsData.map((app) => app.job._id));
      } catch (err) {
        toast.error(`Failed to load jobs: ${err.message}`);
        if (err.message.includes("401")) {
          localStorage.removeItem("token");
          router.push("/");
        }
      }
    };
    fetchData();
  }, [router, statusFilter]); // Re-fetch when statusFilter changes

  const handleApply = async (jobId: string) => {
    if (!resumeFile || !coverLetter) {
      toast.error("Please upload a resume and write a cover letter.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const extractRes = await fetch("http://localhost:5000/api/resume/extract", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!extractRes.ok) throw new Error(`Resume extraction failed: ${extractRes.status}`);
      const { resumeText } = await extractRes.json();

      const applyRes = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, resumeText, coverLetter }),
      });
      if (!applyRes.ok) throw new Error(`Application submission failed: ${applyRes.status}`);
      setAppliedJobs((prev) => [...prev, jobId]);
      setShowApplyModal(null);
      setResumeFile(null);
      setCoverLetter("");
      toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error(`Error applying: ${err.message}`);
      if (err.message.includes("401")) {
        localStorage.removeItem("token");
        router.push("/");
      }
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const textMatch =
      job.title.toLowerCase().includes(filter.toLowerCase()) ||
      job.details.toLowerCase().includes(filter.toLowerCase());

    const skillMatch = skillFilter
      ? job.skills.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase()))
      : true;

    const salaryMatch = () => {
      if (!job.salary) return !minSalary && !maxSalary; // No salary specified, only match if no range set
      const salaryNum = parseInt(job.salary.replace(/[^0-9]/g, ""), 10) || 0;
      const min = minSalary ? parseInt(minSalary, 10) : -Infinity;
      const max = maxSalary ? parseInt(maxSalary, 10) : Infinity;
      return salaryNum >= min && salaryNum <= max;
    };

    return textMatch && skillMatch && salaryMatch();
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#373737]">
      <Navbar userType="candidate" />
      <main className="flex-1 p-6">
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-3xl font-semibold text-center uppercase text-white tracking-wide">All Jobs</h1>
        </div>

        <div className="mb-6 space-y-4">
          {/* Text Search */}
          <input
            type="text"
            placeholder="Search jobs by title or domain..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#d9d9d9] text-[#313131] border border-[#4f4d4d] focus:outline-none focus:ring-2 focus:ring-[#313131]"
          />

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Skill Filter */}
            <div>
              <label className="block text-white mb-1">Filter by Skill</label>
              <input
                type="text"
                placeholder="e.g., React.js"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#d9d9d9] text-[#313131] border border-[#4f4d4d] focus:outline-none focus:ring-2 focus:ring-[#313131]"
              />
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-white mb-1">Min Salary</label>
              <input
                type="number"
                placeholder="e.g., 30000"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#d9d9d9] text-[#313131] border border-[#4f4d4d] focus:outline-none focus:ring-2 focus:ring-[#313131]"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Max Salary</label>
              <input
                type="number"
                placeholder="e.g., 80000"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#d9d9d9] text-[#313131] border border-[#4f4d4d] focus:outline-none focus:ring-2 focus:ring-[#313131]"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-white mb-1">Job Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#d9d9d9] text-[#313131] border border-[#4f4d4d] focus:outline-none focus:ring-2 focus:ring-[#313131]"
            >
              <option value="open">Open Jobs</option>
              <option value="all">All Jobs (Open + Closed)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredJobs.length === 0 ? (
            <p className="text-white text-center col-span-full">No jobs match your filters.</p>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job._id}
                className="job-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-[#d9d9d9]"
              >
                <h3 className="font-semibold text-lg mb-2 text-[#313131]">{job.title}</h3>
                <p className="text-sm text-[#313131]">{job.details}</p>
                <p className="text-xs text-gray-600 mt-1">Skills: {job.skills.join(", ")}</p>
                <p className="text-xs text-gray-600 mt-1">Salary: {job.salary || "Not specified"}</p>
                <p className="text-xs text-gray-600 mt-1">Status: {job.isClosed ? "Closed" : "Open"}</p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => (appliedJobs.includes(job._id) ? null : setShowApplyModal(job))}
                    disabled={appliedJobs.includes(job._id) || job.isClosed}
                    className={`text-sm px-4 py-2 rounded-lg transition duration-200 ${
                      appliedJobs.includes(job._id) || job.isClosed
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-[#313131] text-white hover:bg-[#4a4a4a]"
                    }`}
                  >
                    {appliedJobs.includes(job._id) ? "Applied" : job.isClosed ? "Closed" : "Apply"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showApplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#d9d9d9] p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-[#313131] mb-4">Apply to {showApplyModal.title}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#313131] font-semibold mb-2">Upload Resume (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full p-2 rounded-lg border border-[#313131] text-[#313131]"
                  />
                </div>
                <div>
                  <label className="block text-[#313131] font-semibold mb-2">Cover Letter</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#313131] text-[#313131]"
                    rows={5}
                    placeholder="Write your cover letter here..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowApplyModal(null)}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApply(showApplyModal._id)}
                    className="bg-[#313131] text-white px-4 py-2 rounded hover:bg-[#4a4a4a] transition"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}