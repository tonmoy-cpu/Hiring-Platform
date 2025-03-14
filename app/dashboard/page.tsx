"use client";

import Navbar from "@/components/navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [hoveredJob, setHoveredJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
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
        const [profileRes, jobsRes, appsRes] = await Promise.all([
          fetch("http://localhost:5000/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/jobs", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/applications", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!profileRes.ok || !jobsRes.ok || !appsRes.ok) throw new Error("Failed to fetch data");

        const profile = await profileRes.json();
        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();

        setUserSkills(profile.resumeParsed?.skills || []);
        setJobs(jobsData);
        setAppliedJobs(appsData.map(app => app.job._id));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [router]);

  const getMissingSkills = (job) => {
    return job.skills.filter(skill => !userSkills.includes(skill));
  };

  const handleApply = async (jobId) => {
    if (!resumeFile || !coverLetter) {
      alert("Please upload a resume and write a cover letter.");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const extractRes = await fetch("http://localhost:5000/api/resume/extract", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!extractRes.ok) throw new Error("Resume extraction failed");
      const { resumeText } = await extractRes.json();

      const applyRes = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, resumeText, coverLetter }),
      });
      if (!applyRes.ok) throw new Error("Application submission failed");
      setAppliedJobs((prev) => [...prev, jobId]);
      setShowApplyModal(null);
      setResumeFile(null);
      setCoverLetter("");
      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Error applying:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#373737]">
      <Navbar userType="candidate" />
      <main className="flex-1 p-6">
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-3xl font-semibold text-center uppercase text-white tracking-wide">
            Get Your Job in One Tap
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="job-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 relative bg-[#d9d9d9]"
              onMouseEnter={() => setHoveredJob(job)}
              onMouseLeave={() => setHoveredJob(null)}
            >
              <h3 className="font-semibold text-lg mb-2 text-[#313131]">{job.title}</h3>
              <div className="text-sm text-[#313131]">
                <p>{job.details}</p>
                <p>Skills: {job.skills.join(", ")}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowApplyModal(job)}
                  disabled={appliedJobs.includes(job._id)}
                  className={`text-sm px-4 py-2 rounded-lg transition duration-200 ${
                    appliedJobs.includes(job._id)
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-[#313131] text-white hover:bg-[#4a4a4a]"
                  }`}
                >
                  {appliedJobs.includes(job._id) ? "Applied" : "Apply"}
                </button>
              </div>
              {hoveredJob === job && (
                <div className="absolute top-0 left-0 w-full bg-[#313131] p-4 rounded-lg shadow-lg z-10">
                  <h4 className="text-white font-semibold">Missing Skills:</h4>
                  <ul className="list-disc pl-4 text-white">
                    {getMissingSkills(job).length ? (
                      getMissingSkills(job).map((skill) => <li key={skill}>{skill}</li>)
                    ) : (
                      <li>None</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
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

        <div className="mt-8 flex flex-wrap justify-around gap-4">
          <Link href="/resume-extraction"><button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">Resume Extraction</button></Link>
          <Link href="/track-applications"><button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">Track Applications</button></Link>
          <Link href="/analytics"><button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">AI Analytics</button></Link>
        </div>
      </main>
    </div>
  );
}