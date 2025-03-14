"use client";

import Navbar from "@/components/navbar";
import { CircleUser, FileText, MoreHorizontal, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

export default function TrackApplicants() {
  const [applications, setApplications] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        setApplications(data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };
    fetchApplications();
  }, []);

  const handleChat = (app) => {
    alert(`Chat with ${app.candidate.username} coming soon!`);
  };

  const handleAnalyze = async (app) => {
    try {
      const res = await fetch("http://localhost:5000/api/applications/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ resumeText: app.resumeText, jobId: app.job._id }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const analysisData = await res.json();
      setAnalysis(analysisData);
      setSelectedApplicant(app);
    } catch (err) {
      console.error("Error analyzing:", err);
      alert("Error: " + err.message);
    }
  };

  const handleDetails = (app) => {
    setSelectedApplicant(app);
    setAnalysis(null);
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
                <button onClick={() => handleChat(app)} className="p-2 rounded-full bg-[#313131] hover:bg-[#4a4a4a] transition" title="Chat">
                  <MessageSquare className="h-5 w-5 text-white" />
                </button>
                <button onClick={() => handleAnalyze(app)} className="p-2 rounded-full bg-[#313131] hover:bg-[#4a4a4a] transition" title="Analyze with AI">
                  <MoreHorizontal className="h-5 w-5 text-white" />
                </button>
                <button onClick={() => handleDetails(app)} className="p-2 rounded-full bg-[#313131] hover:bg-[#4a4a4a] transition" title="Details">
                  <FileText className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#d9d9d9] p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#313131] mb-4">{selectedApplicant.candidate.username}’s Details</h2>
            {analysis ? (
              <div className="mt-4">
                <h3 className="font-bold text-[#313131]">AI Analysis</h3>
                <p><strong>Score:</strong> {analysis.score}%</p>
                <p><strong>Feedback:</strong> {analysis.feedback}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold text-[#313131]">Contact</h3>
                    <p>
                      {selectedApplicant.candidate.resumeParsed?.contact?.name || "N/A"}<br />
                      {selectedApplicant.candidate.resumeParsed?.contact?.email || "N/A"}<br />
                      {selectedApplicant.candidate.resumeParsed?.contact?.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#313131]">Skills</h3>
                    <ul className="list-disc pl-4 text-[#313131]">
                      {selectedApplicant.candidate.resumeParsed?.skills?.map((s) => <li key={s}>{s}</li>) || <li>N/A</li>}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#313131]">Experience</h3>
                    {selectedApplicant.candidate.resumeParsed?.experience?.map((e, i) => (
                      <p key={i}>
                        {e.title} at {e.company} ({e.years})
                      </p>
                    )) || <p>N/A</p>}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#313131]">Education</h3>
                    {selectedApplicant.candidate.resumeParsed?.education?.map((e, i) => (
                      <p key={i}>
                        {e.degree}, {e.school} ({e.year})
                      </p>
                    )) || <p>N/A</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-[#313131]">Cover Letter</h3>
                  <p className="text-[#313131]">{selectedApplicant.coverLetter || "N/A"}</p>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-[#313131]">Resume</h3>
                  {selectedApplicant.candidate.resumeFile ? (
                    <a
                      href={`http://localhost:5000${selectedApplicant.candidate.resumeFile}`}
                      download
                      className="text-[#313131] underline hover:text-[#4a4a4a]"
                    >
                      Download Resume
                    </a>
                  ) : (
                    <p>No resume available</p>
                  )}
                </div>
              </>
            )}
            <button
              onClick={() => setSelectedApplicant(null)}
              className="mt-4 bg-[#313131] text-white px-4 py-2 rounded hover:bg-[#4a4a4a] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}