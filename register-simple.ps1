# Simple PowerShell script to register an organizer
$apiUrl = "http://localhost:3000/api/auth/organizer/register"

# Organizer registration data
$organizerData = @{
    name = "Event Organizer"
    email = "organizer@gmail.com"
    password = "password"
    phone = "+251912345678"
    role = "organizer"
    companyName = "EventPro Solutions"
    description = "Professional event planning and management services"
    tinNumber = "12345678915"
    address = "Main Street"
    region = "Addis Ababa"
}

# Admin registration data 
$adminData = @{
    name = "Admin User"
    email = "admin@gmail.com" 
    password = "password"
    role = "admin"
}

$jsonBody = $organizerData | ConvertTo-Json

Write-Host "Sending organizer registration request to $apiUrl"
Write-Host "Request Body:"
Write-Host $jsonBody

# Send organizer registration request
Invoke-RestMethod -Uri $apiUrl -Method Post -Body $jsonBody -ContentType "application/json"

# Send admin registration request
$adminUrl = "http://localhost:3000/api/auth/admin/register"
$adminJson = $adminData | ConvertTo-Json

Write-Host "`nSending admin registration request to $adminUrl"
Write-Host "Request Body:"
Write-Host $adminJson

Invoke-RestMethod -Uri $adminUrl -Method Post -Body $adminJson -ContentType "application/json"