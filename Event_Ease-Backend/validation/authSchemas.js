// validation/authSchemas.js
const Joi = require("joi")

// User registration schema
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid("admin", "organizer", "attendee").default("attendee"),
})

// Login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

// Password reset request schema
const resetRequestSchema = Joi.object({
  email: Joi.string().email().required(),
})

// Password reset schema
const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
})

// Token refresh schema
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
})

module.exports = {
  registerSchema,
  loginSchema,
  resetRequestSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} 