const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/resume", require("./routes/resume"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));