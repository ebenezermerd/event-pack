// config/config.js
require('dotenv').config()

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'eventease',
  dialect: process.env.DB_DIALECT || 'mysql',
}

const NODE_ENV = process.env.NODE_ENV || 'development'
const PORT = process.env.PORT || 3000
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

module.exports = {
  DB_CONFIG,
  NODE_ENV,
  PORT,
  BASE_URL,
  CORS_ORIGIN,
  JWT_SECRET,
} 