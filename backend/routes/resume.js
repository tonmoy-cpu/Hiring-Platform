const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { extractResumeDetails } = require("../utils/ai");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs").promises;
const path = require("path");

// Ensure the uploads/resumes directory exists
const uploadDir = path.join(__dirname, "../../uploads/resumes");
fs.mkdir(uploadDir, { recursive: true })
  .then(() => console.log("Uploads/resumes directory ready"))
  .catch(err => console.error("Failed to create uploads/resumes directory:", err));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Multer saving to:", uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log("Generated filename:", filename);
    cb(null, filename); // Keep original filename with extension
  },
});
const upload = multer({ storage });

router.post("/extract", auth, upload.single("resume"), async (req, res) => {
  if (req.user.userType !== "candidate") {
    console.log("Unauthorized attempt by user:", req.user.id);
    return res.status(403).json({ msg: "Not authorized" });
  }
  if (!req.file) {
    console.log("No resume file uploaded");
    return res.status(400).json({ msg: "No resume uploaded" });
  }

  try {
    const pdfPath = req.file.path;
    console.log("Processing file at:", pdfPath);

    // Read and parse the PDF
    const dataBuffer = await fs.readFile(pdfPath);
    console.log("PDF read successfully, parsing...");
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    // Extract resume details
    const parsedData = await extractResumeDetails(resumeText);
    console.log("Resume parsed:", parsedData);

    // Define the final resume path
    const resumePath = `/uploads/resumes/${req.file.filename}`;
    console.log("Resume stored at:", resumePath);

    // Update user with parsed data and resume path
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumeParsed: parsedData, resumeFile: resumePath },
      { new: true }
    );
    console.log("User updated with resume data:", user.email);

    // Send response
    res.json({ parsedData, resumeText });
  } catch (err) {
    console.error("Error in /extract:", err.message, err.stack);
    res.status(500).json({ msg: "Server error", error: err.message });
  } finally {
    // No cleanup needed since file is saved correctly
    if (req.file) {
      console.log("File processed, stored at:", req.file.path);
    }
  }
});

module.exports = router;