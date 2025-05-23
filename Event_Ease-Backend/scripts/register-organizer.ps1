# PowerShell script to register an organizer
# Usage: ./register-organizer.ps1

# Configuration
$apiUrl = "http://localhost:3000/api/auth/organizer/register"
$organizerData = @{
    name = "John Doe"
    email = "john.organizer@example.com"
    password = "Password123!"
    phone = "+251912345678"
    role = "organizer"
    companyName = "EventPro Solutions"
    description = "Professional event planning and management services"
    tinNumber = "1234567890"
    address = "Main Street"
    region = "Addis Ababa"
}

# Convert to JSON
$jsonBody = $organizerData | ConvertTo-Json

# Send the request
Write-Host "Registering organizer..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $jsonBody -ContentType "application/json" -ErrorAction Stop
    
    # Display response
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($response.user.id)"
    Write-Host "Name: $($response.user.name)"
    Write-Host "Email: $($response.user.email)"
    Write-Host "Role: $($response.user.role)"
    
    if ($response.organizer) {
        Write-Host "Company Name: $($response.organizer.companyName)"
        Write-Host "Approval Status: $($response.organizer.approvalStatus)"
    }
    
    Write-Host "Token: $($response.token)"
} catch {
    Write-Host "Registration failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    
    # Try to get error details
    try {
        $responseBody = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Error: $($responseBody.message)" -ForegroundColor Red
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
} 