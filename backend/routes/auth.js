const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/User");
const multer = require("multer");
const fs = require("fs").promises;
const pdfParse = require("pdf-parse");
const { extractResumeDetails } = require("../utils/ai");

// Ensure uploads directory exists
const uploadDir = "uploads/";
fs.mkdir(uploadDir, { recursive: true }, (err) => {
  if (err) console.error("Failed to create uploads directory:", err);
  else console.log("Uploads directory ready");
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Setting upload destination to uploads/");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});
const upload = multer({ storage });

// Custom middleware to handle Multer
const uploadMiddleware = (req, res, next) => {
  console.log("Entering uploadMiddleware");
  upload.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err.message, "Field:", err.field);
      return res.status(400).json({ msg: "File upload error", error: err.message, field: err.field });
    } else if (err) {
      console.error("Unknown upload error:", err.message);
      return res.status(500).json({ msg: "Upload processing error", error: err.message });
    }
    console.log("Multer processed successfully");
    next();
  });
};

router.post("/register", uploadMiddleware, async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Uploaded files:", req.files);

  const { username, email, password, userType } = req.body;

  try {
    console.log("Validating required fields");
    if (!username || !email || !password || !userType) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    console.log("Checking for existing user");
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const profilePicFile = req.files && req.files.find(file => file.fieldname === "profilePic");
    const resumeFile = req.files && req.files.find(file => file.fieldname === "resume");
    console.log("Profile pic file:", profilePicFile ? profilePicFile.filename : "None");
    console.log("Resume file:", resumeFile ? resumeFile.filename : "None");

    console.log("Creating new user");
    user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      userType,
      profilePic: profilePicFile ? `/uploads/${profilePicFile.filename}` : "/uploads/default.jpg",
    });

    console.log("Saving user to database");
    await user.save();

    if (userType === "candidate" && resumeFile) {
      const pdfPath = resumeFile.path;
      console.log("Processing resume for candidate at:", pdfPath);
      try {
        console.log("Reading PDF");
        const dataBuffer = await fs.readFile(pdfPath);
        console.log("Parsing PDF");
        const pdfData = await pdfParse(dataBuffer);
        const resumeText = pdfData.text;
        console.log("Extracting resume details");
        const parsedData = await extractResumeDetails(resumeText);
        user.resumeParsed = parsedData;
        console.log("Saving parsed resume data");
        await user.save();
        console.log("Cleaning up PDF file");
        await fs.unlink(pdfPath);
      } catch (resumeErr) {
        console.error("Resume processing error:", resumeErr.message);
        // Continue even if resume fails, user is already saved
      }
    }

    console.log("Generating JWT token");
    const payload = { user: { id: user.id, userType: user.userType } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("Sending success response");
    res.json({ token });
  } catch (err) {
    console.error("Error in /register:", err.message, err.stack);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, password });

  try {
    console.log("Fetching user from database");
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    console.log("User found:", user.email);

    console.log("Comparing passwords");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    console.log("Password matched");

    console.log("Generating JWT token");
    const payload = { user: { id: user.id, userType: user.userType } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Token generated successfully");

    res.json({ token });
  } catch (err) {
    console.error("Error in /login:", err.message, err.stack);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.log("User not found for ID:", req.user.id);
      return res.status(404).json({ msg: "User not found" });
    }
    // Ensure profilePic is always a valid string
    user.profilePic = user.profilePic || "/uploads/default.jpg";
    console.log("Returning profile:", { username: user.username, profilePic: user.profilePic });
    res.json(user);
  } catch (err) {
    console.error("Error in /profile:", err.message, err.stack);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

router.put("/profile", auth, async (req, res) => {
  const { resumeParsed } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.resumeParsed = resumeParsed || user.resumeParsed;
    await user.save();

    // Ensure profilePic is included in response
    user.profilePic = user.profilePic || "/uploads/default.jpg";
    res.json(user);
  } catch (err) {
    console.error("Error in PUT /profile:", err.message, err.stack);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;