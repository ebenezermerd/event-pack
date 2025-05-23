// validation/authSchemas.js
const Joi = require("joi")

// User registration schema
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid("admin", "organizer", "attendee").default("attendee"),
  
  // Organizer specific fields (only required when role is organizer)
  companyName: Joi.when('role', {
    is: 'organizer',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  description: Joi.string().optional(),
  logo: Joi.string().optional(),
  website: Joi.string().optional(),
  address: Joi.string().optional(),
  region: Joi.string().optional(),
  tinNumber: Joi.when('role', {
    is: 'organizer',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  verificationDocuments: Joi.array().items(Joi.string()).optional(),
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