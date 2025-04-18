const express = require("express");
const rateLimit = require("express-rate-limit");
const User = require("../models/User.js"); // Import the User model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});


// Debugging log
console.log("✅ Auth Routes Initialized");

// REGISTER a new user
router.post("/register", async (req, res) => {
  console.log("ℹ️ Register API hit");
  
  try {
    const { name, email, password } = req.body;
    console.log("🔹 Register Request Body:", { name, email });

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("🔹 Password hashed");

    // Create a new user
    user = new User({ name, email, password: hashedPassword });
    await user.save();
    console.log("✅ User registered successfully:", email);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Error in /register:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// LOGIN user
router.post("/login", loginLimiter, async (req, res) => {

  console.log("ℹ️ Login API hit");

  try {
    const { email, password } = req.body;
    console.log("🔹 Login Request Body:", { email });

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password"); // Ensure password is fetched
    if (!user) {
      console.log("❌ Invalid email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password for:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in .env file");
      return res.status(500).json({ message: "Server error: JWT_SECRET not set" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("✅ Login successful for:", email);

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("❌ Error in /login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PROTECTED ROUTE (Only accessible if user is authenticated)
router.get("/protected", authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  console.log("ℹ️ Protected API hit for user:", req.user);
  res.json({ message: "This is a protected route", user: req.user });
});

module.exports = router;
