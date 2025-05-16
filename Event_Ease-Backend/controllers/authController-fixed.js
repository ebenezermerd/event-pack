const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const config = require("../config/config")

// User Registration
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
    } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Map frontend roles to database roles
    let dbRole = 'user'; // Default
    
    if (req.path && req.path.includes('/admin/register')) {
      dbRole = 'admin';
    } else if (role === 'admin') {
      dbRole = 'admin';
    } else {
      // All other roles (organizer, attendee) map to 'user'
      dbRole = 'user';
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: dbRole,
      status: "active",
      joinDate: new Date(),
      emailVerified: false,
    })

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: "1d" }
    )

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Update last login
    await user.update({ lastLogin: new Date() })

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: "1d" }
    )

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Logout
exports.logout = async (req, res) => {
  // Since we're using JWT, we don't need to do anything server-side
  // The client should remove the token from storage
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  })
}

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Reset password request
exports.resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Generate reset token
    const token = jwt.sign(
      { id: user.id, action: "reset_password" },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: "1h" }
    )

    // Save token and expiry
    user.resetPasswordToken = token
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await user.save()

    // In a real application, send email with reset link
    // For now, just return success
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    })
  } catch (error) {
    console.error("Reset password request error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    // Find user by token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Update password and clear reset fields
    user.password = hashedPassword
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret')
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      })
    }

    if (decoded.action !== "verify_email") {
      return res.status(400).json({
        success: false,
        message: "Invalid token type",
      })
    }

    // Find user
    const user = await User.findByPk(decoded.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Mark email as verified
    user.emailVerified = true
    await user.save()

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Verify email error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    // Verify refresh token
    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-jwt-secret')
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      })
    }

    // Generate new token
    const token = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: "1d" }
    )

    res.status(200).json({
      success: true,
      token,
    })
  } catch (error) {
    console.error("Refresh token error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
} 