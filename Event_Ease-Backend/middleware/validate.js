// middleware/validate.js
/**
 * Validation middleware factory
 * Creates a middleware that validates request data against a Joi schema
 */
const Joi = require("joi")

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Include all errors
      allowUnknown: true, // Ignore unknown props
      stripUnknown: false, // Keep unknown props
    })

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ")
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errorMessage,
      })
    }

    next()
  }
}

module.exports = validate
