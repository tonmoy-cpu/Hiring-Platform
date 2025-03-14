const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { extractResumeDetails } = require("../utils/ai");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs").promises;
const path = require("path");

const upload = multer({ dest: "uploads/resumes/" });

router.post("/extract", auth, upload.single("resume"), async (req, res) => {
  if (req.user.userType !== "candidate") return res.status(403).json({ msg: "Not authorized" });

  try {
    if (!req.file) throw new Error("No resume file uploaded");

    const pdfPath = req.file.path;
    const dataBuffer = await fs.readFile(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    const parsedData = await extractResumeDetails(resumeText);
    const resumePath = `/uploads/resumes/${req.file.filename}.pdf`;
    await fs.rename(pdfPath, path.join(__dirname, "../..", resumePath));

    await User.findByIdAndUpdate(req.user.id, {
      resumeParsed: parsedData,
      resumeFile: resumePath,
    });

    res.json({ parsedData, resumeText });
  } catch (err) {
    console.error("Error in /extract:", err.message, err.stack);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;