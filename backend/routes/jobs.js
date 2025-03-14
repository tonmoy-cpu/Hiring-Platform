const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const auth = require("../middleware/auth");
const { analyzeResumeAgainstJob } = require("../utils/ai");

// Post Job (Recruiter)
router.post("/", auth, async (req, res) => {
  if (req.user.userType !== "recruiter") {
    console.log("Unauthorized attempt by user:", req.user.id);
    return res.status(403).json({ msg: "Not authorized" });
  }

  const { title, details, skills, salary } = req.body;
  console.log("Received job data:", { title, details, skills, salary, recruiter: req.user.id });

  if (!title || !details || !skills || !salary) {
    console.log("Missing required fields:", req.body);
    return res.status(400).json({ msg: "All fields (title, details, skills, salary) are required" });
  }

  try {
    const job = new Job({
      title,
      details,
      skills: Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()),
      salary,
      recruiter: req.user.id,
    });
    await job.save();
    console.log("Job saved successfully:", job);
    res.status(201).json(job);
  } catch (err) {
    console.error("Error saving job:", err.message, err.stack);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get All Jobs
router.get("/", auth, async (req, res) => {
  try {
    const jobs = await Job.find().populate("recruiter", "company username");
    console.log("Fetched jobs:", jobs.length);
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// Match Jobs (Candidate) - unchanged
router.get("/match", auth, async (req, res) => {
  if (req.user.userType !== "candidate") return res.status(403).json({ msg: "Not authorized" });

  try {
    const user = await User.findById(req.user.id);
    const jobs = await Job.find();
    const matches = await Promise.all(
      jobs.map(async (job) => {
        const { score, matchedSkills } = await analyzeResumeAgainstJob(
          `${user.skills.join(" ")} ${user.experience.map((e) => e.title).join(" ")}`,
          job
        );
        return { ...job._doc, score, explanation: `Matched skills: ${matchedSkills.join(", ")}` };
      })
    );
    res.json(matches.sort((a, b) => b.score - a.score));
  } catch (err) {
    console.error("Error in /match:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;