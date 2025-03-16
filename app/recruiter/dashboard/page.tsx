"use client";

import Navbar from "@/components/navbar";
import { FileText, Edit, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { skillOptions, domainOptions } from "@/lib/utils";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({ title: "", details: "", skills: [] });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType && userType !== "recruiter") {
      toast.error("Access denied. Redirecting...");
      router.push("/dashboard");
      return;
    }
    if (pathname !== "/recruiter/dashboard") {
      router.push("/recruiter/dashboard");
    }
  }, [pathname, router]);

  const fetchJobs = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/jobs/recruiter", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch jobs: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.message.includes("401")) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/");
      } else {
        toast.error("Failed to load jobs: " + err.message);
      }
    }
  };

  useEffect(() => {
    fetchJobs();
    return () => {
      setJobs([]);
      setEditingJob(null);
    };
  }, [router]);

  const handleEdit = (job) => {
    setEditingJob(job._id);
    setFormData({
      title: job.title || "",
      details: job.details || "",
      skills: job.skills || [],
    });
  };

  const handleClose = async (jobId) => {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to close this job?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/close`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed to close job");
      }
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast.success("Job closed successfully!");
    } catch (err) {
      console.error("Close error:", err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleSaveEdit = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed to update job");
      }
      const updatedJob = await res.json();
      setJobs((prev) =>
        prev.map((job) => (job._id === jobId ? updatedJob : job))
      );
      setEditingJob(null);
      toast.success("Job updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSkillChange = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#373737]" key={pathname}>
      <Navbar userType="recruiter" />
      <main className="flex-1 p-6 w-full" style={{ maxWidth: "100%", width: "100%" }}>
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md w-full">
          <h1 className="text-3xl font-semibold text-center uppercase text-white">Recruiter Dashboard</h1>
        </div>
        <div className="space-y-6 w-full" style={{ maxWidth: "100%", width: "100%" }}>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div
                key={job._id}
                className="bg-[#d9d9d9] p-4 rounded-lg shadow-md w-full recruiter-job-card"
                style={{
                  width: "100%",
                  minWidth: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }}
              >
                {editingJob === job._id ? (
                  <div className="w-full">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-2 mb-2 border rounded text-[#313131]"
                      placeholder="Job Title"
                    />
                    <select
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      className="w-full p-2 mb-2 border rounded text-[#313131]"
                    >
                      <option value="">Select a domain</option>
                      {domainOptions.map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                    <div className="mb-4">
                      <h3 className="font-bold text-[#313131] mb-2">Skills</h3>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {skillOptions.map((skill) => (
                          <label key={skill} className="flex items-center text-[#313131]">
                            <input
                              type="checkbox"
                              checked={formData.skills.includes(skill)}
                              onChange={() => handleSkillChange(skill)}
                              className="mr-2"
                            />
                            {skill}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2 w-full">
                      <button
                        onClick={() => handleSaveEdit(job._id)}
                        className="flex-1 bg-[#313131] text-white py-2 rounded hover:bg-[#4a4a4a] transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingJob(null)}
                        className="flex-1 bg-[#313131] text-white py-2 rounded hover:bg-[#4a4a4a] transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center flex-1 min-w-0">
                      <FileText className="h-10 w-10 text-[#313131] mr-4 flex-shrink-0" />
                      <div className="text-[#313131] flex-1">
                        <p className="font-bold text-lg">{job.title || "Untitled"}</p>
                        <p className="text-sm">{job.details || "No details"}</p>
                        <p className="text-xs mt-1">
                          <strong>Skills:</strong> {(job.skills || []).join(", ") || "None"}
                        </p>
                        <p className="text-xs mt-1">
                          <strong>Salary:</strong> {job.salary || "Not specified"}
                        </p>
                        <p className="text-xs mt-1">
                          <strong>Status:</strong> {job.isClosed ? "Closed" : "Open"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {job.isClosed === false && (
                        <>
                          <button
                            onClick={() => handleEdit(job)}
                            className="p-2 rounded-full bg-[#313131] hover:bg-[#4a4a4a] transition"
                            title="Edit Job"
                          >
                            <Edit className="h-5 w-5 text-white" />
                          </button>
                          <button
                            onClick={() => handleClose(job._id)}
                            className="p-2 rounded-full bg-[#313131] hover:bg-[#4a4a4a] transition"
                            title="Close Job"
                          >
                            <X className="h-5 w-5 text-white" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-white w-full">No jobs posted yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}