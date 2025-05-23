#!/bin/bash
# Shell script to register an organizer using curl
# Usage: bash register-organizer.sh

API_URL="http://localhost:3000/api/auth/organizer/register"

# JSON data for the organizer
JSON_DATA='{
  "name": "John Doe",
  "email": "john.organizer@example.com",
  "password": "Password123!",
  "phone": "+251912345678",
  "role": "organizer",
  "companyName": "EventPro Solutions",
  "description": "Professional event planning and management services",
  "tinNumber": "1234567890",
  "address": "Main Street",
  "region": "Addis Ababa"
}'

echo "Registering organizer..."

# Send the request using curl
curl -X POST \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA" \
  "$API_URL"

echo ""
echo "Request sent. Check the response above." 