/**
 * Environment variables with type safety and default values
 */

// API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Authentication
export const JWT_EXPIRATION = process.env.NEXT_PUBLIC_JWT_EXPIRATION || "1d"

// File Upload
export const MAX_FILE_SIZE = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || 5) // In MB
export const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || "/api/upload"

// Application
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "EventEase"
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Event Management Platform for Ethiopia"

// AWS Configuration (not exposed to client)
export const AWS_CONFIG = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  bucket: process.env.AWS_S3_BUCKET || "eventease-uploads",
}

// Payment Processing (not exposed to client)
export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
}

// Chapa Payment Gateway (Ethiopia)
export const CHAPA_CONFIG = {
  secretKey: process.env.CHAPA_SECRET_KEY || "",
  publicKey: process.env.CHAPA_PUBLIC_KEY || "",
  baseUrl: "https://api.chapa.co/v1",
}

// Caching (not exposed to client)
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

/**
 * Helper function to get environment variables with type safety
 */
export function getEnv<T>(key: string, defaultValue: T): T {
  const value = process.env[`NEXT_PUBLIC_${key}`]

  if (value === undefined) {
    return defaultValue
  }

  // Handle different types
  if (typeof defaultValue === "boolean") {
    return (value === "true") as unknown as T
  }

  if (typeof defaultValue === "number") {
    return Number(value) as unknown as T
  }

  return value as unknown as T
}

/**
 * Check if we're in development mode
 */
export const isDevelopment = process.env.NODE_ENV === "development"

/**
 * Check if we're in production mode
 */
export const isProduction = process.env.NODE_ENV === "production"

/**
 * Check if we're in test mode
 */
export const isTest = process.env.NODE_ENV === "test"
