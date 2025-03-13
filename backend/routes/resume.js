const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { extractResumeDetails } = require("../utils/ai");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs").promises;

const upload = multer({ dest: "uploads/resumes/" });

router.post("/extract", auth, upload.single("resume"), async (req, res) => {
  if (req.user.userType !== "candidate") return res.status(403).json({ msg: "Not authorized" });

  try {
    if (!req.file) throw new Error("No resume file uploaded");

    console.log("Processing file:", req.file.path);
    const pdfPath = req.file.path;
    const dataBuffer = await fs.readFile(pdfPath);
    console.log("PDF read successfully");

    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;
    console.log("PDF text extracted:", resumeText.slice(0, 100)); // Log first 100 chars

    const parsedData = await extractResumeDetails(resumeText);
    console.log("Parsed data:", parsedData);

    await User.findByIdAndUpdate(req.user.id, { resumeParsed: parsedData });
    console.log("User updated in MongoDB");

    await fs.unlink(pdfPath);
    console.log("File deleted");

    res.json(parsedData);
  } catch (err) {
    console.error("Error in /extract:", err.message, err.stack);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;