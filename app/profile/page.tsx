"use client";

import Navbar from "@/components/navbar";
import { useState, useEffect } from "react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);
      setFormData(data.resumeParsed || {});
    };
    fetchProfile();
  }, []);

  const handleChange = (e, section, index) => {
    const updated = { ...formData };
    if (section === "contact") {
      updated.contact = { ...updated.contact, [e.target.name]: e.target.value };
    } else {
      updated[section][index] = { ...updated[section][index], [e.target.name]: e.target.value };
    }
    setFormData(updated);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeParsed: formData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to update profile");
      
      setProfile({ ...profile, resumeParsed: formData });
      setEditMode(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error: " + err.message);
    }
  };

  if (!profile) return <div className="min-h-screen bg-[#373737] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#373737]">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-3xl font-semibold text-center uppercase text-white">Profile Details</h1>
        </div>
        <div className="bg-[#d9d9d9] p-8 rounded-lg shadow-md">
          {/* Profile Photo */}
          <div className="flex justify-center mb-6">
            <img
              src={`http://localhost:5000${profile.profilePic}`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-[#313131] shadow-lg"
              onError={(e) => (e.target.src = "/default.jpg")}
            />
          </div>

          {/* Basic Info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#313131]">{profile.username}</h2>
            <p className="text-[#313131]">{profile.email}</p>
            <p className="text-sm text-gray-600 capitalize">{profile.userType}</p>
          </div>

          {/* Resume Details */}
          {profile.resumeParsed ? (
            editMode ? (
              <div className="mt-4">
                <h3 className="font-bold text-[#313131] text-lg mb-2">Contact</h3>
                <input name="name" value={formData.contact?.name || ""} onChange={(e) => handleChange(e, "contact")} className="input-field mb-2" />
                <input name="email" value={formData.contact?.email || ""} onChange={(e) => handleChange(e, "contact")} className="input-field mb-2" />
                <input name="phone" value={formData.contact?.phone || ""} onChange={(e) => handleChange(e, "contact")} className="input-field mb-2" />
                
                <h3 className="font-bold text-[#313131] text-lg mt-4 mb-2">Skills</h3>
                {formData.skills?.map((skill, i) => (
                  <input key={i} name="skill" value={skill} onChange={(e) => handleChange(e, "skills", i)} className="input-field mb-2" />
                ))}
                
                <h3 className="font-bold text-[#313131] text-lg mt-4 mb-2">Experience</h3>
                {formData.experience?.map((exp, i) => (
                  <div key={i} className="mb-2">
                    <input name="title" value={exp.title || ""} onChange={(e) => handleChange(e, "experience", i)} className="input-field" />
                    <input name="company" value={exp.company || ""} onChange={(e) => handleChange(e, "experience", i)} className="input-field" />
                    <input name="years" value={exp.years || ""} onChange={(e) => handleChange(e, "experience", i)} className="input-field" />
                  </div>
                ))}
                
                <h3 className="font-bold text-[#313131] text-lg mt-4 mb-2">Education</h3>
                {formData.education?.map((edu, i) => (
                  <div key={i} className="mb-2">
                    <input name="degree" value={edu.degree || ""} onChange={(e) => handleChange(e, "education", i)} className="input-field" />
                    <input name="school" value={edu.school || ""} onChange={(e) => handleChange(e, "education", i)} className="input-field" />
                    <input name="year" value={edu.year || ""} onChange={(e) => handleChange(e, "education", i)} className="input-field" />
                  </div>
                ))}
                <div className="flex justify-center mt-6">
                  <button onClick={handleSave} className="bg-[#313131] text-white px-6 py-2 rounded hover:bg-[#4a4a4a] transition">Save</button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="font-bold text-[#313131] text-lg mb-2">Contact</h3>
                  <p className="text-[#313131]">{profile.resumeParsed.contact?.name || "N/A"}</p>
                  <p className="text-[#313131]">{profile.resumeParsed.contact?.email || "N/A"}</p>
                  <p className="text-[#313131]">{profile.resumeParsed.contact?.phone || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#313131] text-lg mb-2">Skills</h3>
                  <ul className="list-disc pl-4 text-[#313131]">
                    {profile.resumeParsed.skills?.map(s => <li key={s}>{s}</li>) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-[#313131] text-lg mb-2">Experience</h3>
                  {profile.resumeParsed.experience?.map((e, i) => (
                    <p key={i} className="text-[#313131]">{e.title} at {e.company} ({e.years})</p>
                  )) || <p className="text-[#313131]">N/A</p>}
                </div>
                <div>
                  <h3 className="font-bold text-[#313131] text-lg mb-2">Education</h3>
                  {profile.resumeParsed.education?.map((e, i) => (
                    <p key={i} className="text-[#313131]">{e.degree}, {e.school} ({e.year})</p>
                  )) || <p className="text-[#313131]">N/A</p>}
                </div>
                <div className="flex justify-center mt-6">
                  <button onClick={() => setEditMode(true)} className="bg-[#313131] text-white px-6 py-2 rounded hover:bg-[#4a4a4a] transition">Edit</button>
                </div>
              </div>
            )
          ) : (
            <p className="text-center text-[#313131]">No resume uploaded yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}

function showToast(message) {
  window.dispatchEvent(new CustomEvent("show-toast", { detail: message }));
}