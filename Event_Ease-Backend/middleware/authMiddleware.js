const jwt = require("jsonwebtoken")
const { User, Organizer } = require("../models/association")
const config = require("../config/config")

const optionalAuth = (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization")?.split(" ")[1] || req.cookies?.authToken

  // If no token, continue without setting user
  if (!token) {
    req.user = null
    return next()
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    // If token is invalid, continue without setting user
    req.user = null
    next()
  }
}

// Verify JWT token
const userAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ success: false, message: "No token, authorization denied" })
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET)

    // Check if user exists
    const user = await User.findByPk(decoded.id)
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    }

    // Add user to request object
    req.user = decoded
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(401).json({ success: false, message: "Token is not valid" })
  }
}

// Check user role
const checkRole = (role) => {
  return (req, res, next) => {
    // For user role, check if the user exists
    if (role === "user") {
      next()
      return
    }

    // For organizer role, check if the user is an organizer
    if (role === "organizer") {
      Organizer.findOne({ where: { userId: req.user.id } })
        .then((organizer) => {
          if (!organizer) {
            return res.status(403).json({
              success: false,
              message: "Access denied: Organizer role required",
            })
          }
          next()
        })
        .catch((error) => {
          console.error("Role check error:", error)
          return res.status(500).json({ success: false, message: error.message })
        })
      return
    }

    // For admin role, check if the user is an admin
    if (role === "admin" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admin role required",
      })
    }

    next()
  }
}

module.exports = {
  userAuth,
  checkRole,
  optionalAuth,
}
