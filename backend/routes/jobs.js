const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const auth = require("../middleware/auth");
const Application = require("../models/Application");
const User = require("../models/User");

router.post("/", auth, async (req, res) => {
  if (req.user.userType !== "recruiter") return res.status(403).json({ msg: "Not authorized" });

  const { title, details, skills } = req.body;
  if (!title || !details || !skills) return res.status(400).json({ msg: "Missing required fields" });

  try {
    const job = new Job({
      title,
      details,
      skills,
      recruiter: req.user.id,
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error("Error in /jobs:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    let jobs;
    if (req.user.userType === "candidate") {
      const user = await User.findById(req.user.id);
      const appliedJobs = await Application.find({ candidate: req.user.id }).select("job");
      const appliedJobIds = appliedJobs.map((app) => app.job.toString());

      // Fetch jobs matching preferred skills or domains, excluding closed jobs
      jobs = await Job.find({
        isClosed: false,
        $or: [
          { skills: { $in: user.preferredSkills } },
          { details: { $in: user.preferredDomains.map((d) => new RegExp(d, "i")) } },
        ],
      }).populate("recruiter", "username");

      // Add applied status to jobs
      jobs = jobs.map((job) => ({
        ...job._doc,
        isApplied: appliedJobIds.includes(job._id.toString()),
      }));
    } else {
      jobs = await Job.find({ isClosed: false }).populate("recruiter", "username");
    }
    res.json(jobs);
  } catch (err) {
    console.error("Error in /jobs:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/recruiter", auth, async (req, res) => {
  if (req.user.userType !== "recruiter") return res.status(403).json({ msg: "Not authorized" });

  try {
    const jobs = await Job.find({ recruiter: req.user.id });
    res.json(jobs);
  } catch (err) {
    console.error("Error in /jobs/recruiter:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  if (req.user.userType !== "recruiter") return res.status(403).json({ msg: "Not authorized" });

  const { title, details, skills } = req.body;
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job not found" });
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to edit this job" });
    }

    job.title = title || job.title;
    job.details = details || job.details;
    job.skills = skills || job.skills;
    await job.save();
    res.json(job);
  } catch (err) {
    console.error("Error in /jobs/:id:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/:id/close", auth, async (req, res) => {
  if (req.user.userType !== "recruiter") return res.status(403).json({ msg: "Not authorized" });

  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job not found" });
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to close this job" });
    }

    job.isClosed = true;
    await job.save();
    res.json(job);
  } catch (err) {
    console.error("Error in /jobs/:id/close:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;