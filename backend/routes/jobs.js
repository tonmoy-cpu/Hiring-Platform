const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const auth = require("../middleware/auth");
const { analyzeResumeAgainstJob } = require("../utils/ai");

// Post Job (Recruiter)
router.post("/", auth, async (req, res) => {
  if (req.user.userType !== "recruiter") return res.status(403).json({ msg: "Not authorized" });

  const { title, details, skills, salary } = req.body;
  try {
    const job = new Job({ title, details, skills, salary, recruiter: req.user.id });
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get All Jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate("recruiter", "company");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Match Jobs (Candidate)
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
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;