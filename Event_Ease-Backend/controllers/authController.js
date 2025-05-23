const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const Organizer = require("../models/organizer")
const config = require("../config/config")
const { Op } = require("sequelize")
const { v4: uuidv4 } = require("uuid")

// User Registration
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      // Organizer specific fields
      companyName,
      description,
      logo,
      website,
      address,
      region,
      tinNumber,
      verificationDocuments
    } = req.body

    // Log the registration request for debugging
    console.log("Registration request:", {
      path: req.path,
      role,
      hasCompanyName: !!companyName,
      hasTinNumber: !!tinNumber,
      hasVerificationDocs: Array.isArray(verificationDocuments) && verificationDocuments.length > 0
    });

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

    // Map specific register routes to roles, or use the provided role
    let dbRole = 'attendee'; // Default
    
    if (req.path && req.path.includes('/admin/register')) {
      dbRole = 'admin';
    } else if (req.path && req.path.includes('/organizer/register')) {
      dbRole = 'organizer';
    } else if (role === 'admin' || role === 'organizer' || role === 'attendee') {
      dbRole = role;
    }

    // Create user
    const user = await User.create({
      id: uuidv4(), // Ensure we use UUID for the user ID
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: dbRole,
      status: "active",
      joinDate: new Date(),
      emailVerified: false,
    })

    // If the user is registering as an organizer, create an organizer profile
    let organizerData = null;
    if (dbRole === 'organizer') {
      // Check if required organizer fields are provided
      if (!companyName || !tinNumber) {
        console.warn(`User ${user.id} registered as organizer but missing required organizer fields. Company Name: ${companyName}, TIN: ${tinNumber}`);
        return res.status(400).json({
          success: false,
          message: "Organizer registration requires companyName and tinNumber",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        });
      } else {
        try {
          // Check if TIN number is already used
          const organizerWithTin = await Organizer.findOne({
            where: { tinNumber },
          })

          if (organizerWithTin) {
            // TIN already in use
            console.warn(`TIN number ${tinNumber} is already registered`);
            return res.status(400).json({
              success: false,
              message: `TIN number ${tinNumber} is already registered with another organizer`,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              }
            });
          } else {
            // Create organizer profile
            console.log("Creating organizer profile with data:", {
              userId: user.id,
              companyName,
              tinNumber,
              verificationDocuments: Array.isArray(verificationDocuments) ? 
                `${verificationDocuments.length} documents` : 
                (verificationDocuments ? 'present but not in array format' : 'not provided')
            });
            
            const organizer = await Organizer.create({
              userId: user.id,
              companyName,
              description: description || null,
              logo: logo || null,
              website: website || null,
              address: address || null,
              region: region || null,
              tinNumber,
              verificationDocuments: verificationDocuments || null,
              approvalStatus: "pending",
            })
            
            organizerData = {
              companyName: organizer.companyName,
              approvalStatus: organizer.approvalStatus,
              tinNumber: organizer.tinNumber
            };
            
            console.log("Organizer profile created successfully:", organizerData);
          }
        } catch (organizerError) {
          console.error("Error creating organizer profile:", organizerError);
          return res.status(500).json({
            success: false,
            message: "User created but failed to create organizer profile: " + organizerError.message,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            }
          });
        }
      }
    }

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
      organizer: organizerData,
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

/**
 * Get the current user's profile based on their role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    res.json({ user })
  } catch (error) {
    console.error("Error fetching current user:", error)
    res.status(500).json({ message: "Server error" })
  }
}

/**
 * Get the current user's profile (specifically for attendees)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    res.json({ user })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({ message: "Server error" })
  }
}

/**
 * Get the current organizer's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getOrganizerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    const organizer = await Organizer.findOne({ userId: req.user.id }).populate('userId', '-password')
    if (!organizer) {
      return res.status(404).json({ message: "Organizer profile not found" })
    }
    
    res.json({ organizer })
  } catch (error) {
    console.error("Error fetching organizer profile:", error)
    res.status(500).json({ message: "Server error" })
  }
}

/**
 * Get the current admin's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    res.json({ user })
  } catch (error) {
    console.error("Error fetching admin profile:", error)
    res.status(500).json({ message: "Server error" })
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

/**
 * Special login handler for admin users via the secret admin login page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.loginAdmin = async (req, res) => {
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

    // Check if user is an admin
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
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
      message: "Admin login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
} 