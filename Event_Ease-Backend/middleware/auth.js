const jwt = require("jsonwebtoken")

// General token verification function
const verifyToken = (req, res, next) => {
  let token

  // From cookies
  if (req.cookies?.authToken) {
    token = req.cookies.authToken
  }
  // From headers
  else if (req.headers["authorization"]) {
    token = req.headers["authorization"].split(" ")[1]
  }

  if (!token) {
    // For middleware usage with next()
    if (next) {
      req.user = null
      return next()
    }
    // For direct usage in routes
    return null
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET)
    req.user = user

    // For middleware usage
    if (next) {
      return next()
    }
    // For direct usage in routes
    return user
  } catch (error) {
    // For middleware usage
    if (next) {
      req.user = null
      return next()
    }
    // For direct usage in routes
    return null
  }
}

// Update the userAuth middleware to handle the case when no token is found
const userAuth = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err)

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" })
    }

    if (req.user.role !== "user" && req.user.role !== "organizer" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. User role required." })
    }

    next()
  })
}

// Update the adminAuth middleware similarly
const adminAuth = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err)

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" })
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." })
    }

    next()
  })
}

// Update the userOrAdminAuth middleware similarly
const userOrAdminAuth = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err)

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" })
    }

    if (req.user.role !== "admin" && req.user.role !== "user") {
      return res.status(403).json({ success: false, message: "Access denied. Only Admin or User role allowed." })
    }

    next()
  })
}

module.exports = {
  userAuth,
  adminAuth,
  userOrAdminAuth,
}
