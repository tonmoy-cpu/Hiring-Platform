"use client";

import Navbar from "@/components/navbar";
import { CircleUser, FileText, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

export default function TrackApplicants() {
  const [applications, setApplications] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApplications(data);
    };
    fetchApplications();
  }, []);

  const handleAnalyze = async (app) => {
    const res = await fetch("http://localhost:5000/api/applications/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ resumeText: app.resumeText, jobId: app.job._id }),
    });
    const analysis = await res.json();
    setSelectedApplicant({ ...app, analysis });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#373737]">
      <Navbar userType="recruiter" />
      <main className="flex-1 p-6">
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-3xl font-semibold text-center uppercase text-white">Track Applicants</h1>
        </div>
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app._id} className="bg-[#d9d9d9] p-4 rounded-lg flex items-center shadow-md">
              <CircleUser className="h-10 w-10 text-[#313131] mr-4" />
              <div className="flex-1 text-[#313131]">
                <p className="font-bold text-lg">{app.candidate.username}</p>
                <p className="text-sm">{app.job.title}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => setSelectedApplicant(app)} className="p-2 rounded-full bg-[#313131] hover:bg-[#4a4a4a] transition">
                  <FileText className="h-5 w-5 text-white" />
                </button>
                <button onClick={() => handleAnalyze(app)} className="p-2 rounded-full bg-[#313131] hover:bg-[#4a4a4a] transition">
                  <MoreHorizontal className="h-5 w-5 text-white" />
                </button>
                <button className="bg-[#313131] text-white text-sm px-4 py-2 rounded hover:bg-[#4a4a4a] transition">Select</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#d9d9d9] p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold text-[#313131] mb-4">{selectedApplicant.candidate.username}’s Details</h2>
            {selectedApplicant.resumeText ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold">Contact</h3>
                    <p>{selectedApplicant.candidate.resumeParsed?.contact?.name || "N/A"}<br/>
                       {selectedApplicant.candidate.resumeParsed?.contact?.email || "N/A"}<br/>
                       {selectedApplicant.candidate.resumeParsed?.contact?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-bold">Skills</h3>
                    <ul className="list-disc pl-4">{selectedApplicant.candidate.resumeParsed?.skills?.map(s => <li key={s}>{s}</li>) || "N/A"}</ul>
                  </div>
                  <div>
                    <h3 className="font-bold">Experience</h3>
                    {selectedApplicant.candidate.resumeParsed?.experience?.map((e, i) => <p key={i}>{e.title} at {e.company} ({e.years})</p>) || "N/A"}
                  </div>
                  <div>
                    <h3 className="font-bold">Education</h3>
                    {selectedApplicant.candidate.resumeParsed?.education?.map((e, i) => <p key={i}>{e.degree}, {e.school} ({e.year})</p>) || "N/A"}
                  </div>
                </div>
                {selectedApplicant.analysis && (
                  <div className="mt-4">
                    <h3 className="font-bold">Analysis</h3>
                    <p><strong>Score:</strong> {selectedApplicant.analysis.score}%</p>
                    <p><strong>Feedback:</strong> {selectedApplicant.analysis.feedback}</p>
                    <p><strong>Missing Skills:</strong> {selectedApplicant.analysis.missingSkills?.join(", ") || "None"}</p>
                  </div>
                )}
              </>
            ) : (
              <p>No resume uploaded.</p>
            )}
            <button onClick={() => setSelectedApplicant(null)} className="mt-4 bg-[#313131] text-white px-4 py-2 rounded hover:bg-[#4a4a4a] transition">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function showToast(message) {
  window.dispatchEvent(new CustomEvent("show-toast", { detail: message }));
}