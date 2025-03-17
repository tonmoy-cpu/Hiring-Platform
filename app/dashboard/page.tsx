"use client";

import Navbar from "@/components/navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { skillOptions, domainOptions } from "@/lib/utils";
import io from "socket.io-client";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applications, setApplications] = useState([]); // New state for applications
  const [userSkills, setUserSkills] = useState([]);
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [preferredDomains, setPreferredDomains] = useState([]);
  const [hoveredJob, setHoveredJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(null);
  const [showPreferencesPopup, setShowPreferencesPopup] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [hasPreferences, setHasPreferences] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const [showChatModal, setShowChatModal] = useState(null); // Chat modal state
  const [chatMessages, setChatMessages] = useState([]); // Chat messages state
  const [newMessage, setNewMessage] = useState(""); // New message input
  const [attachment, setAttachment] = useState(null); // Attachment input
  const [notifications, setNotifications] = useState([]); // Notifications state
  const [socket, setSocket] = useState(null); // Socket.IO instance
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const socketInstance = io("http://localhost:5000", { auth: { token } });
    setSocket(socketInstance);

    const fetchData = async () => {
      try {
        const [profileRes, jobsRes, appsRes] = await Promise.all([
          fetch("http://localhost:5000/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/jobs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/applications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!profileRes.ok) throw new Error(`Profile fetch failed with status: ${profileRes.status}`);
        if (!jobsRes.ok) throw new Error(`Jobs fetch failed with status: ${jobsRes.status}`);
        if (!appsRes.ok) throw new Error(`Applications fetch failed with status: ${appsRes.status}`);

        const profile = await profileRes.json();
        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();

        setUserSkills(profile.resumeParsed?.skills || []);
        setPreferredSkills(profile.preferredSkills || []);
        setPreferredDomains(profile.preferredDomains || []);
        setHasPreferences(profile.preferredSkills?.length > 0 || profile.preferredDomains?.length > 0);
        setJobs(jobsData);
        setAppliedJobs(appsData.map((app) => app.job._id));
        setApplications(appsData); // Set applications

        if (!profile.preferredSkills?.length && !profile.preferredDomains?.length && !toastShown) {
          toast.custom(
            (t) => (
              <div
                className="bg-[#313131] text-white p-4 rounded-lg shadow-lg flex items-center justify-between max-w-md"
                style={{ borderRadius: "8px" }}
              >
                <span>Please add your preferred skills and domains to see relevant jobs!</span>
                <button
                  onClick={() => {
                    setShowPreferencesPopup(true);
                    toast.dismiss(t.id);
                  }}
                  className="bg-[#4a4a4a] text-white px-3 py-1 rounded-lg hover:bg-[#5a5a5a] transition ml-4"
                >
                  Add Now
                </button>
              </div>
            ),
            {
              duration: 5000,
              position: "top-right",
            }
          );
          setToastShown(true);
        }
      } catch (err) {
        toast.error("Failed to load dashboard data: " + err.message);
        if (err.message.includes("401")) {
          localStorage.removeItem("token");
          router.push("/");
        }
      }
    };
    fetchData();

    socketInstance.on("connect", () => console.log("Socket connected"));
    socketInstance.on("connect_error", (err) => console.error("Socket error:", err));
    socketInstance.on("message", (message) => {
      if (showChatModal) setChatMessages((prev) => [...prev, message]);
    });
    socketInstance.on("notification", ({ chatId, message }) => {
      if (message.sender !== localStorage.getItem("userId")) {
        setNotifications((prev) => [...prev, { chatId, message }]);
        setTimeout(() => setNotifications((prev) => prev.slice(1)), 5000);
      }
    });

    return () => {
      socketInstance.off("message");
      socketInstance.off("notification");
      socketInstance.off("connect");
      socketInstance.off("connect_error");
      socketInstance.disconnect();
    };
  }, [router, toastShown, showChatModal]);

  const getMissingSkills = (job) => {
    return job.skills.filter((skill) => !userSkills.includes(skill));
  };

  const handleSkillChange = (skill) => {
    setPreferredSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleDomainChange = (domain) => {
    setPreferredDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const savePreferences = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferredSkills, preferredDomains }),
      });
      if (!res.ok) throw new Error(`Failed to save preferences with status: ${res.status}`);
      setHasPreferences(true);
      setShowPreferencesPopup(false);
      const jobsRes = await fetch("http://localhost:5000/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!jobsRes.ok) throw new Error(`Jobs refresh failed with status: ${jobsRes.status}`);
      setJobs(await jobsRes.json());
      toast.success("Preferences saved successfully!");
    } catch (err) {
      toast.error("Error saving preferences: " + err.message);
      if (err.message.includes("401")) {
        localStorage.removeItem("token");
        router.push("/");
      }
    }
  };

  const handleApply = async (jobId) => {
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
      if (!extractRes.ok) throw new Error(`Resume extraction failed with status: ${extractRes.status}`);
      const { resumeText } = await extractRes.json();

      const applyRes = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, resumeText, coverLetter }),
      });
      if (!applyRes.ok) throw new Error(`Application submission failed with status: ${applyRes.status}`);
      const newApplication = await applyRes.json();
      setAppliedJobs((prev) => [...prev, jobId]);
      setApplications((prev) => [...prev, newApplication]); // Update applications
      setShowApplyModal(null);
      setResumeFile(null);
      setCoverLetter("");
      toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error("Error applying: " + err.message);
      if (err.message.includes("401")) {
        localStorage.removeItem("token");
        router.push("/");
      }
    }
  };

  const handleChat = async (applicationId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load chat");
      const chat = await res.json();
      setShowChatModal(chat);
      setChatMessages(chat.messages);
      socket.emit("joinChat", chat._id);

      await fetch(`http://localhost:5000/api/chat/${chat._id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      toast.error(`Error loading chat: ${err.message}`);
    }
  };

  const sendMessage = async () => {
    if (!newMessage && !attachment) return;
    const token = localStorage.getItem("token");
    const formData = new FormData();
    if (newMessage) formData.append("content", newMessage);
    if (attachment) formData.append("attachment", attachment);

    try {
      const res = await fetch(`http://localhost:5000/api/chat/${showChatModal._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to send message");
      const message = await res.json();
      socket.emit("sendMessage", { chatId: showChatModal._id, message });
      setNewMessage("");
      setAttachment(null);
    } catch (err) {
      toast.error(`Error sending message: ${err.message}`);
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

        {/* Recommended Jobs Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Recommended Jobs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  <p>Salary: {job.salary || "Not specified"}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => (appliedJobs.includes(job._id) ? null : setShowApplyModal(job))}
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
        </div>

        {/* My Applications Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">My Applications</h2>
          {applications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {applications.map((app) => (
                <div key={app._id} className="bg-[#d9d9d9] p-4 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="text-[#313131]">
                      <p className="font-bold text-lg">{app.job.title}</p>
                      <p className="text-sm">Status: {app.status}</p>
                      <p className="text-sm">Applied on: {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleChat(app._id)}
                      className="p-2 rounded-full bg-[#313131] hover:bg-[#4a4a4a] transition"
                      title="Chat with Recruiter"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white">No applications yet. Apply to jobs above!</p>
          )}
        </div>

        {/* Apply Modal */}
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

        {/* Preferences Popup */}
        {showPreferencesPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#d9d9d9] p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[#313131] mb-4">Set Your Preferences</h2>
              <div className="mb-4">
                <h3 className="font-bold text-[#313131] mb-2">Skills</h3>
                <div className="grid grid-cols-2 gap-2">
                  {skillOptions.map((skill) => (
                    <label key={skill} className="flex items-center text-[#313131]">
                      <input
                        type="checkbox"
                        checked={preferredSkills.includes(skill)}
                        onChange={() => handleSkillChange(skill)}
                        className="mr-2"
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <h3 className="font-bold text-[#313131] mb-2">Domains</h3>
                <div className="grid grid-cols-1 gap-2">
                  {domainOptions.map((domain) => (
                    <label key={domain} className="flex items-center text-[#313131]">
                      <input
                        type="checkbox"
                        checked={preferredDomains.includes(domain)}
                        onChange={() => handleDomainChange(domain)}
                        className="mr-2"
                      />
                      {domain}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-between space-x-4">
                <button
                  onClick={savePreferences}
                  className="bg-[#313131] text-white px-6 py-2 rounded-lg hover:bg-[#4a4a4a] transition w-full"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setShowPreferencesPopup(false)}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {showChatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#d9d9d9] p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h2 className="text-xl font-bold text-[#313131] mb-4">
                Chat for {applications.find((app) => app._id === showChatModal.application)?.job.title}
              </h2>
              <div className="h-64 overflow-y-auto mb-4 bg-white p-2 rounded">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${msg.sender === localStorage.getItem("userId") ? "text-right" : "text-left"}`}
                  >
                    <p className="text-[#313131]">{msg.content}</p>
                    {msg.attachment && (
                      <a href={`http://localhost:5000${msg.attachment}`} target="_blank" className="text-blue-500">
                        {msg.attachmentType === "link" ? msg.content : `Attachment (${msg.attachmentType})`}
                      </a>
                    )}
                    <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full p-2 rounded-lg border border-[#313131] text-[#313131]"
                placeholder="Type a message..."
              />
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                className="mt-2"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setShowChatModal(null)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={sendMessage}
                  className="bg-[#313131] text-white px-4 py-2 rounded hover:bg-[#4a4a4a]"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {notifications.map((notif, index) => (
          <div
            key={index}
            className="fixed top-4 right-4 bg-[#313131] text-white p-4 rounded-lg shadow-lg z-50"
          >
            New message in chat {notif.chatId}
          </div>
        ))}

        {/* Navigation Buttons */}
        <div className="mt-8 flex flex-wrap justify-around gap-4">
          <a href="/resume-extraction">
            <button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">
              Resume Extraction
            </button>
          </a>
          <a href="/track-applications">
            <button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">
              Track Applications
            </button>
          </a>
          <a href="/analytics">
            <button className="bg-[#313131] text-white p-3 rounded-lg hover:bg-[#4a4a4a] transition duration-200 shadow-md w-48">
              AI Analytics
            </button>
          </a>
        </div>
      </main>
    </div>
  );
}