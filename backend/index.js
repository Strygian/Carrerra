const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") }); // Explicitly load .env from backend directory

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // Import DB connection function

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Stop the server if DB fails
  });

// Middleware
app.use(cors());
app.use(express.json()); // Ensure JSON body parsing is enabled

// Debugging logs
console.log("ℹ️ Middleware initialized");

// Load routes
try {
  const authRoutes = require("./routes/AuthRoutes");

  const resumeRoutes = require("./routes/resumeRoutes");
  app.use("/api/auth", authRoutes);
  app.use("/api/resume", resumeRoutes);
  console.log("✅ Auth routes loaded at /api/auth");
  console.log("✅ Resume routes loaded at /api/resume");
} catch (error) {
  console.error("❌ Error loading routes:", error);
}




// ✅ Add a Test Route
app.get("/api/test", (req, res) => {
  console.log("✅ /api/test endpoint hit");
  res.json({ message: "🔥 API is working!" });
});

// Default Route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// Start Server (Only Once)
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
