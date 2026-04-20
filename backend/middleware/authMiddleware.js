const jwt = require("jsonwebtoken");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // ❗ check blacklist
      const blacklisted = await TokenBlacklist.findOne({ token });
      if (blacklisted) {
        return res.status(401).json({ message: "Token expired. Login again." });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;

      next();
    } else {
      return res.status(401).json({ message: "No token provided" });
    }
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = protect;