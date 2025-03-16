"use client";

import Navbar from "@/components/navbar";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { skillOptions, domainOptions } from "@/lib/utils"; // Import centralized lists

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [preferredDomains, setPreferredDomains] = useState([]);
  const [showPreferencesPopup, setShowPreferencesPopup] = useState(false);
  const [toastShown, setToastShown] = useState(false); // Prevent repeated toasts

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found");
      return null;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
      const data = await res.json();
      console.log("Profile fetched:", data);
      setProfile(data);
      setFormData(data.resumeParsed || { contact: {}, skills: [], experience: [], education: [] });
      setPreferredSkills(data.preferredSkills || []);
      setPreferredDomains(data.preferredDomains || []);
      return data;
    } catch (err) {
      console.error("Error fetching profile:", err.message);
      return null;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const profileData = await fetchProfile();
      if (
        profileData &&
        profileData.userType === "candidate" &&
        (!profileData.preferredSkills?.length || !profileData.preferredDomains?.length) &&
        !toastShown
      ) {
        console.log("Triggering toast for preferred skills/domains");
        toast.custom(
          (t) => (
            <div
              className="bg-[#313131] text-white p-4 rounded-lg shadow-lg flex items-center justify-between max-w-md"
              style={{ borderRadius: "8px" }}
            >
              <span>Please add your preferred skills and domains to see relevant jobs!</span>
              <button
                onClick={() => {
                  console.log("Add Now clicked");
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
    };
    loadProfile();
  }, [toastShown]);

  const handleChange = (e, section) => {
    const updated = { ...formData };
    if (section === "contact") {
      updated.contact = { ...updated.contact, [e.target.name]: e.target.value };
    }
    setFormData(updated);
  };

  const handleArrayChange = (section, index, value) => {
    const updated = { ...formData };
    if (section === "skills") {
      updated.skills[index] = value;
    } else {
      updated[section][index] = { ...updated[section][index], ...value };
    }
    setFormData(updated);
  };

  const addItem = (section) => {
    const updated = { ...formData };
    if (section === "skills") {
      updated.skills.push("");
    } else if (section === "experience") {
      updated.experience.push({ title: "", company: "", years: "" });
    } else if (section === "education") {
      updated.education.push({ degree: "", school: "", year: "" });
    }
    setFormData(updated);
  };

  const removeItem = (section, index) => {
    const updated = { ...formData };
    updated[section].splice(index, 1);
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
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/auth/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferredSkills, preferredDomains }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save preferences with status: ${res.status} - ${errorText}`);
      }
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setShowPreferencesPopup(false);
      toast.success("Preferences saved successfully!");
    } catch (err) {
      console.error("Error saving preferences:", err);
      toast.error("Error saving preferences: " + err.message);
    }
  };

  if (!profile) return <div className="min-h-screen bg-[#373737] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#373737]">
      <Navbar userType={profile.userType} />
      <main className="flex-1 p-6">
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-3xl font-semibold text-center uppercase text-white">Profile Details</h1>
        </div>
        <div className="bg-[#d9d9d9] p-8 rounded-lg shadow-md">
          <div className="flex justify-center mb-6">
            <img
              src={`http://localhost:5000${profile.profilePic}`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-[#313131] shadow-lg"
              onError={(e) => (e.target.src = "/default.jpg")}
            />
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#313131]">{profile.username}</h2>
            <p className="text-[#313131]">{profile.email}</p>
            <p className="text-sm text-gray-600 capitalize">{profile.userType}</p>
          </div>
          {profile.resumeParsed ? (
            editMode ? (
              <div className="mt-4">
                <h3 className="font-bold text-[#313131] text-lg mb-2">Contact</h3>
                <input
                  name="name"
                  value={formData.contact?.name || ""}
                  onChange={(e) => handleChange(e, "contact")}
                  className="input-field mb-2"
                  placeholder="Name"
                />
                <input
                  name="email"
                  value={formData.contact?.email || ""}
                  onChange={(e) => handleChange(e, "contact")}
                  className="input-field mb-2"
                  placeholder="Email"
                />
                <input
                  name="phone"
                  value={formData.contact?.phone || ""}
                  onChange={(e) => handleChange(e, "contact")}
                  className="input-field mb-2"
                  placeholder="Phone"
                />
                <h3 className="font-bold text-[#313131] text-lg mt-4 mb-2">Skills</h3>
                {formData.skills?.map((skill, i) => (
                  <div key={i} className="flex items-center mb-2">
                    <input
                      value={skill}
                      onChange={(e) => handleArrayChange("skills", i, e.target.value)}
                      className="input-field flex-1"
                      placeholder="Skill"
                    />
                    <button
                      onClick={() => removeItem("skills", i)}
                      className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addItem("skills")}
                  className="bg-[#313131] text-white px-4 py-1 rounded hover:bg-[#4a4a4a] mt-2"
                >
                  Add Skill
                </button>
                <h3 className="font-bold text-[#313131] text-lg mt-4 mb-2">Experience</h3>
                {formData.experience?.map((exp, i) => (
                  <div key={i} className="mb-4 border-b pb-2">
                    <input
                      name="title"
                      value={exp.title || ""}
                      onChange={(e) => handleArrayChange("experience", i, { title: e.target.value })}
                      className="input-field mb-2"
                      placeholder="Job Title"
                    />
                    <input
                      name="company"
                      value={exp.company || ""}
                      onChange={(e) => handleArrayChange("experience", i, { company: e.target.value })}
                      className="input-field mb-2"
                      placeholder="Company"
                    />
                    <input
                      name="years"
                      value={exp.years || ""}
                      onChange={(e) => handleArrayChange("experience", i, { years: e.target.value })}
                      className="input-field mb-2"
                      placeholder="Years (e.g., 2019-2021)"
                    />
                    <button
                      onClick={() => removeItem("experience", i)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addItem("experience")}
                  className="bg-[#313131] text-white px-4 py-1 rounded hover:bg-[#4a4a4a] mt-2"
                >
                  Add Experience
                </button>
                <h3 className="font-bold text-[#313131] text-lg mt-4 mb-2">Education</h3>
                {formData.education?.map((edu, i) => (
                  <div key={i} className="mb-4 border-b pb-2">
                    <input
                      name="degree"
                      value={edu.degree || ""}
                      onChange={(e) => handleArrayChange("education", i, { degree: e.target.value })}
                      className="input-field mb-2"
                      placeholder="Degree"
                    />
                    <input
                      name="school"
                      value={edu.school || ""}
                      onChange={(e) => handleArrayChange("education", i, { school: e.target.value })}
                      className="input-field mb-2"
                      placeholder="School"
                    />
                    <input
                      name="year"
                      value={edu.year || ""}
                      onChange={(e) => handleArrayChange("education", i, { year: e.target.value })}
                      className="input-field mb-2"
                      placeholder="Year"
                    />
                    <button
                      onClick={() => removeItem("education", i)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addItem("education")}
                  className="bg-[#313131] text-white px-4 py-1 rounded hover:bg-[#4a4a4a] mt-2"
                >
                  Add Education
                </button>
                <div className="flex justify-center mt-6 space-x-4">
                  <button
                    onClick={() => setEditMode(false)}
                    className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-[#313131] text-white px-6 py-2 rounded hover:bg-[#4a4a4a] transition"
                  >
                    Save
                  </button>
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
                    {profile.resumeParsed.skills?.map((s) => <li key={s}>{s}</li>) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-[#313131] text-lg mb-2">Experience</h3>
                  {profile.resumeParsed.experience?.map((e, i) => (
                    <p key={i} className="text-[#313131]">
                      {e.title} at {e.company} ({e.years})
                    </p>
                  )) || <p className="text-[#313131]">N/A</p>}
                </div>
                <div>
                  <h3 className="font-bold text-[#313131] text-lg mb-2">Education</h3>
                  {profile.resumeParsed.education?.map((e, i) => (
                    <p key={i} className="text-[#313131]">
                      {e.degree}, {e.school} ({e.year})
                    </p>
                  )) || <p className="text-[#313131]">N/A</p>}
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-[#313131] text-white px-6 py-2 rounded hover:bg-[#4a4a4a] transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          ) : (
            <p className="text-center text-[#313131]">No resume uploaded yet.</p>
          )}
        </div>

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
      </main>
    </div>
  );
}

function showToast(message) {
  window.dispatchEvent(new CustomEvent("show-toast", { detail: message }));
}