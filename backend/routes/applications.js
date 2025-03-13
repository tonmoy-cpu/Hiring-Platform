const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Job = require("../models/Job");
const auth = require("../middleware/auth");
const { analyzeResumeAgainstJob } = require("../utils/ai");

router.post("/apply", auth, async (req, res) => {
  if (req.user.userType !== "candidate") return res.status(403).json({ msg: "Not authorized" });

  const { jobId, resumeText } = req.body;
  try {
    const job = await Job.findById(jobId);
    const { score, feedback } = await analyzeResumeAgainstJob(resumeText, job);

    const application = new Application({
      candidate: req.user.id,
      job: jobId,
      resumeText,
      compatibilityScore: score,
      feedback,
    });
    await application.save();
    res.json(application);
  } catch (err) {
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
      .populate("candidate", "username resumeParsed")
      .populate("job", "title skills");
    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/analyze", auth, async (req, res) => {
  if (req.user.userType !== "recruiter") return res.status(403).json({ msg: "Not authorized" });

  const { resumeText, jobId } = req.body;
  try {
    const job = await Job.findById(jobId);
    const analysis = await analyzeResumeAgainstJob(resumeText, job);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;