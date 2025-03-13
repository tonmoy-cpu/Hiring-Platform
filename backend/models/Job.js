const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: { type: String, required: true },
  skills: [{ type: String, required: true }],
  salary: { type: String, required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", jobSchema);