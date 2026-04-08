const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
require("./utils/cronJobs");

// Middlewares
const protect = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const escrowRoutes = require("./routes/escrowRoutes"); // ✅ NEW

dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Built-in middleware
app.use(express.json());
app.use(cors());

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blockchain", require("./routes/blockchainRoutes"));
app.use("/api/escrow", escrowRoutes); // ✅ NEW

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Escrow Platform API is Running...");
});

// ================= PROTECTED ROUTES =================

// Any logged-in user
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You accessed protected route",
    user: req.user,
  });
});

// Client only
app.get(
  "/api/client-only",
  protect,
  authorizeRoles("client"),
  (req, res) => {
    res.json({
      message: "Only clients can access this route",
    });
  }
);

// Freelancer only
app.get(
  "/api/freelancer-only",
  protect,
  authorizeRoles("freelancer"),
  (req, res) => {
    res.json({
      message: "Only freelancers can access this route",
    });
  }
);

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});