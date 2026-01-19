# Test script for OpenStreetMap API integration
$baseUrl = "http://localhost:3000"

Write-Host "=== Test OpenStreetMap Integration ===" -ForegroundColor Cyan

# 1. Register a driver
Write-Host "`n1. Registering a test driver..." -ForegroundColor Yellow
$registerBody = @{
    email = "testdriver_osm@test.com"
    password = "Password123"
    role = "driver"
    phone = "+33612345678"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/driver/register" -ContentType "application/json" -Body $registerBody
    Write-Host "Driver registered successfully!" -ForegroundColor Green
    $registerResponse | ConvertTo-Json
} catch {
    Write-Host "Registration failed (maybe user already exists): $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Login
Write-Host "`n2. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "testdriver_osm@test.com"
    password = "Password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/driver/login" -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.accessToken
    Write-Host "Login successful! Token received: $($token.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Test route initialization with OpenStreetMap
Write-Host "`n3. Testing route initialization (Paris -> Tour Eiffel)..." -ForegroundColor Yellow
$routeBody = @{
    origin = @{
        lat = 48.8566
        lng = 2.3522
    }
    destination = @{
        lat = 48.8584
        lng = 2.2945
    }
    travelMode = "DRIVE"
    language = "fr"
    provideAlternatives = $true
} | ConvertTo-Json -Depth 3

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $routeResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/routes/init" -Headers $headers -Body $routeBody
    Write-Host "Route calculated successfully!" -ForegroundColor Green
    Write-Host "`nSession ID: $($routeResponse.sessionId)" -ForegroundColor Cyan
    Write-Host "Distance: $($routeResponse.currentRoute.distance.text)" -ForegroundColor Cyan
    Write-Host "Duration: $($routeResponse.currentRoute.duration.text)" -ForegroundColor Cyan
    Write-Host "Number of steps: $($routeResponse.currentRoute.steps.Count)" -ForegroundColor Cyan

    if ($routeResponse.alternatives) {
        Write-Host "Alternatives: $($routeResponse.alternatives.Count)" -ForegroundColor Cyan
    }

    Write-Host "`nFirst 3 instructions:" -ForegroundColor Yellow
    $routeResponse.currentRoute.steps | Select-Object -First 3 | ForEach-Object {
        Write-Host "  - $($_.instruction) ($($_.distance.text))" -ForegroundColor White
    }

    $sessionId = $routeResponse.sessionId
} catch {
    Write-Host "Route calculation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Add a waypoint
Write-Host "`n4. Adding a waypoint (Musee du Louvre)..." -ForegroundColor Yellow
$waypointBody = @{
    sessionId = $sessionId
    newWaypoint = @{
        lat = 48.8606
        lng = 2.3376
    }
} | ConvertTo-Json -Depth 3

try {
    $waypointResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/routes/add-waypoint" -Headers $headers -Body $waypointBody
    Write-Host "Waypoint added successfully!" -ForegroundColor Green
    Write-Host "New distance: $($waypointResponse.currentRoute.distance.text)" -ForegroundColor Cyan
    Write-Host "New duration: $($waypointResponse.currentRoute.duration.text)" -ForegroundColor Cyan
    Write-Host "Waypoints count: $($waypointResponse.metadata.waypointsCount)" -ForegroundColor Cyan
} catch {
    Write-Host "Add waypoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Get route status
Write-Host "`n5. Getting route status..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Method Get -Uri "$baseUrl/routes/$sessionId" -Headers $headers
    Write-Host "Route status retrieved successfully!" -ForegroundColor Green
    Write-Host "Travel mode: $($statusResponse.metadata.travelMode)" -ForegroundColor Cyan
} catch {
    Write-Host "Get status failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Finalize route
Write-Host "`n6. Finalizing route..." -ForegroundColor Yellow
try {
    $finalizeResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/routes/finalize/$sessionId" -Headers $headers
    Write-Host "Route finalized successfully!" -ForegroundColor Green
} catch {
    Write-Host "Finalize failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== All tests completed! ===" -ForegroundColor Cyan
