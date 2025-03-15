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
      status: "Applied",
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
    let query;
    if (req.user.userType === "recruiter") {
      // Fetch only applications for jobs posted by this recruiter, excluding "Not Selected"
      query = {
        job: { $in: await Job.find({ recruiter: req.user.id }).select("_id") },
        status: { $ne: "Not Selected" }, // Exclude "Not Selected" applications
      };
    } else {
      // For candidates, fetch all their applications
      query = { candidate: req.user.id };
    }
    const applications = await Application.find(query)
      .populate("candidate", "username resumeParsed resumeFile")
      .populate("job", "title details skills");
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

router.put("/:id/status", auth, async (req, res) => {
  if (req.user.userType !== "recruiter") return res.status(403).json({ msg: "Not authorized" });

  const { status } = req.body;
  const validStatuses = ["Applied", "Under Review", "Selected", "Not Selected"];
  if (!validStatuses.includes(status)) return res.status(400).json({ msg: "Invalid status" });

  try {
    console.log("PUT /api/applications/:id/status - ID:", req.params.id, "User:", req.user.id);
    const application = await Application.findById(req.params.id).populate("job");
    if (!application) {
      console.log("Application not found for ID:", req.params.id);
      return res.status(404).json({ msg: "Application not found" });
    }
    console.log("Application found:", application._id, "Job recruiter:", application.job.recruiter);
    if (application.job.recruiter.toString() !== req.user.id) {
      console.log("Unauthorized: Recruiter ID", req.user.id, "does not match", application.job.recruiter);
      return res.status(403).json({ msg: "Not authorized to update this application" });
    }

    application.status = status;
    await application.save();
    console.log("Status updated to:", status);
    res.status(200).json(application);
  } catch (err) {
    console.error("Error in /status:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;