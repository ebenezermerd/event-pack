// middleware/validate.js
/**
 * Validation middleware factory
 * Creates a middleware that validates request data against a Joi schema
 */
const Joi = require("joi")

const validate = (schema) => {
  return (req, res, next) => {
    // Log the request info for debugging
    const contentType = req.headers['content-type'] || '';
    console.log('Validation Middleware:');
    console.log('  Path:', req.path);
    console.log('  Method:', req.method);
    console.log('  Content-Type:', contentType);
    console.log('  Body Type:', typeof req.body);
    console.log('  Body Empty:', Object.keys(req.body || {}).length === 0);
    
    // Handle case where req.body is undefined or empty
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('Empty request body received');
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "Request body is empty or missing required fields"
      });
    }
    
    // Normalize any fields if needed
    const normalizedBody = { ...req.body };
    
    // If we have verificationDocuments as a string that looks like JSON, try to parse it
    if (typeof normalizedBody.verificationDocuments === 'string' && 
        (normalizedBody.verificationDocuments.startsWith('[') || normalizedBody.verificationDocuments.startsWith('['))) {
      try {
        normalizedBody.verificationDocuments = JSON.parse(normalizedBody.verificationDocuments);
      } catch (e) {
        console.warn('Failed to parse verificationDocuments string:', e.message);
      }
    }
    
    // Ensure verificationDocuments is always an array
    if (normalizedBody.verificationDocuments && !Array.isArray(normalizedBody.verificationDocuments)) {
      if (typeof normalizedBody.verificationDocuments === 'string') {
        normalizedBody.verificationDocuments = [normalizedBody.verificationDocuments];
      } else {
        delete normalizedBody.verificationDocuments;
      }
    }
    
    // Log the actual body content
    try {
      console.log('  Normalized Body Content:', JSON.stringify(normalizedBody, null, 2));
    } catch (e) {
      console.log('  Body Content: [Cannot stringify body]', e.message);
    }
    
    // Validate against schema
    const { error } = schema.validate(normalizedBody, {
      abortEarly: false, // Include all errors
      allowUnknown: true, // Ignore unknown props
      stripUnknown: false, // Keep unknown props
    })

    if (error) {
      console.log('Validation Error Details:', JSON.stringify(error.details, null, 2));
      const errorMessage = error.details.map((detail) => detail.message).join(", ")
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errorMessage,
      })
    }

    // Update req.body with normalized values
    req.body = normalizedBody;
    next()
  }
}

module.exports = validate
