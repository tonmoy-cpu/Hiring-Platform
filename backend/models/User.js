const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["recruiter", "candidate"], required: true },
  profilePic: { type: String, default: "default.jpg" },
  // Parsed Resume Fields for Candidates
  resumeParsed: {
    contact: { name: String, email: String, phone: String },
    skills: [{ type: String }],
    experience: [{ title: String, company: String, years: String }],
    education: [{ degree: String, school: String, year: String }],
  },
  company: { type: String }, // Recruiter field
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);