"use client";

import Navbar from "@/components/navbar";
import { FileText, Edit, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({ title: "", details: "", skills: "" });

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/jobs/recruiter", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        alert("Error: " + err.message);
      }
    };
    fetchJobs();
  }, []);

  const handleEdit = (job) => {
    setEditingJob(job._id);
    setFormData({
      title: job.title,
      details: job.details,
      skills: job.skills.join(", "),
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
      showToast("Job closed successfully!");
    } catch (err) {
      console.error("Error closing job:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleSaveEdit = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      const skillsArray = formData.skills.split(",").map((s) => s.trim());
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, skills: skillsArray }),
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
      showToast("Job updated successfully!");
    } catch (err) {
      console.error("Error updating job:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#373737]">
      <Navbar userType="recruiter" />
      <main className="flex-1 p-6">
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-3xl font-semibold text-center uppercase text-white">Recruiter Dashboard</h1>
        </div>
        <div className="space-y-6">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job._id} className="bg-[#d9d9d9] p-4 rounded-lg shadow-md">
                {editingJob === job._id ? (
                  <div>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-2 mb-2 border rounded text-[#313131]"
                      placeholder="Job Title"
                    />
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      className="w-full p-2 mb-2 border rounded text-[#313131]"
                      placeholder="Job Details"
                    />
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      className="w-full p-2 mb-2 border rounded text-[#313131]"
                      placeholder="Skills (comma-separated)"
                    />
                    <div className="flex space-x-2">
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
                  <div>
                    <div className="flex items-center">
                      <FileText className="h-10 w-10 text-[#313131] mr-4" />
                      <div className="flex-1 text-[#313131]">
                        <p className="font-bold text-lg">{job.title}</p>
                        <p className="text-sm">{job.details}</p>
                        <p className="text-xs mt-1">
                          <strong>Skills:</strong> {job.skills.join(", ")}
                        </p>
                        <p className="text-xs mt-1">
                          <strong>Status:</strong> {job.isClosed ? "Closed" : "Open"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!job.isClosed && (
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
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-white">No jobs posted yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}

function showToast(message) {
  window.dispatchEvent(new CustomEvent("show-toast", { detail: message }));
}