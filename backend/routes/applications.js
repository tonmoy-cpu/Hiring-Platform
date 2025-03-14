const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Job = require("../models/Job");
const auth = require("../middleware/auth");
const { analyzeResumeAgainstJob } = require("../utils/ai");

router.post("/apply", auth, async (req, res) => {
  if (req.user.userType !== "candidate") return res.status(403).json({ msg: "Not authorized" });

  const { jobId, resumeText, coverLetter } = req.body;
  if (!jobId || !resumeText || !coverLetter) return res.status(400).json({ msg: "Missing required fields" });

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    const { score, feedback } = await analyzeResumeAgainstJob(resumeText, job);

    const application = new Application({
      candidate: req.user.id,
      job: jobId,
      resumeText,
      coverLetter,
      compatibilityScore: score,
      feedback,
    });
    await application.save();
    res.status(201).json(application);
  } catch (err) {
    console.error("Error in /apply:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const query =
      req.user.userType === "recruiter"
        ? { job: { $in: await Job.find({ recruiter: req.user.id }).select("_id") } }
        : { candidate: req.user.id };
    const applications = await Application.find(query)
      .populate("candidate", "username resumeParsed resumeFile")
      .populate("job", "title skills");
    res.json(applications);
  } catch (err) {
    console.error("Error in /applications:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/analyze", auth, async (req, res) => {
  if (req.user.userType !== "recruiter") return res.status(403).json({ msg: "Not authorized" });

  const { resumeText, jobId } = req.body;
  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });
    const analysis = await analyzeResumeAgainstJob(resumeText, job);
    res.json(analysis);
  } catch (err) {
    console.error("Error in /analyze:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;