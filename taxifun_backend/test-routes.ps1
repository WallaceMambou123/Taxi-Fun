# Script de test automatisé pour le module Routes (PowerShell)
# Usage: .\test-routes.ps1

$ErrorActionPreference = "Stop"

$BASE_URL = "http://localhost:3000"
$EMAIL = "test-driver-$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$PASSWORD = "Test1234!"

Write-Host "🚀 Début des tests du module Routes" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

function Step {
    param($Message)
    Write-Host "▶ $Message" -ForegroundColor Yellow
}

function Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# 1. Enregistrement
Step "1. Création d'un compte chauffeur"
$registerBody = @{
    email = $EMAIL
    password = $PASSWORD
    role = "driver"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody

    Success "Compte créé: $EMAIL"
} catch {
    Error "Échec de création du compte"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""

# 2. Login
Step "2. Connexion"
$loginBody = @{
    email = $EMAIL
    password = $PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    $TOKEN = $loginResponse.access_token

    if ([string]::IsNullOrEmpty($TOKEN)) {
        throw "Token non reçu"
    }

    Success "Connecté - Token reçu"
} catch {
    Error "Échec de connexion"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""

# 3. Initialiser un itinéraire
Step "3. Initialisation d'un itinéraire (Paris → Lyon)"
$initBody = @{
    origin = @{
        lat = 48.8566
        lng = 2.3522
        address = "Paris, France"
    }
    destination = @{
        lat = 45.7640
        lng = 4.8357
        address = "Lyon, France"
    }
    travelMode = "DRIVE"
    provideAlternatives = $true
    language = "fr"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $TOKEN"
}

try {
    $initResponse = Invoke-RestMethod -Uri "$BASE_URL/routes/init" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $initBody

    $SESSION_ID = $initResponse.sessionId

    if ([string]::IsNullOrEmpty($SESSION_ID)) {
        throw "Session ID non reçu"
    }

    Success "Itinéraire initialisé - Session ID: $SESSION_ID"
} catch {
    Error "Échec d'initialisation"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""

# 4. Ajouter un waypoint (Dijon)
Step "4. Ajout d'un waypoint (Dijon)"
$waypoint1Body = @{
    sessionId = $SESSION_ID
    newWaypoint = @{
        lat = 47.3220
        lng = 5.0415
        address = "Dijon, France"
    }
} | ConvertTo-Json

try {
    $waypoint1Response = Invoke-RestMethod -Uri "$BASE_URL/routes/add-waypoint" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $waypoint1Body

    if ($waypoint1Response.metadata.waypointsCount -eq 1) {
        Success "Premier waypoint ajouté (Dijon)"
    } else {
        throw "Nombre de waypoints incorrect"
    }
} catch {
    Error "Échec d'ajout du waypoint"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""

# 5. Ajouter un second waypoint (Mâcon)
Step "5. Ajout d'un second waypoint (Mâcon)"
$waypoint2Body = @{
    sessionId = $SESSION_ID
    newWaypoint = @{
        lat = 46.3064
        lng = 4.8317
        address = "Mâcon, France"
    }
} | ConvertTo-Json

try {
    $waypoint2Response = Invoke-RestMethod -Uri "$BASE_URL/routes/add-waypoint" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $waypoint2Body

    if ($waypoint2Response.metadata.waypointsCount -eq 2) {
        Success "Second waypoint ajouté (Mâcon)"
    } else {
        throw "Nombre de waypoints incorrect"
    }
} catch {
    Error "Échec d'ajout du second waypoint"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""

# 6. Récupérer l'état de l'itinéraire
Step "6. Récupération de l'état de l'itinéraire"
try {
    $statusResponse = Invoke-RestMethod -Uri "$BASE_URL/routes/$SESSION_ID" `
        -Method Get `
        -Headers $headers

    Success "État récupéré avec succès"

    if ($statusResponse.currentRoute.distance.text) {
        Write-Host "   Distance totale: $($statusResponse.currentRoute.distance.text)"
    }
    if ($statusResponse.currentRoute.duration.text) {
        Write-Host "   Durée totale: $($statusResponse.currentRoute.duration.text)"
    }
} catch {
    Error "Échec de récupération de l'état"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""

# 7. Récupérer les sessions actives
Step "7. Récupération des sessions actives"
try {
    $activeResponse = Invoke-RestMethod -Uri "$BASE_URL/routes/user/active" `
        -Method Get `
        -Headers $headers

    $found = $false
    foreach ($session in $activeResponse) {
        if ($session.id -eq $SESSION_ID) {
            $found = $true
            break
        }
    }

    if ($found) {
        Success "Sessions actives récupérées"
    } else {
        throw "Session non trouvée dans les sessions actives"
    }
} catch {
    Error "Échec de récupération des sessions actives"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""

# 8. Finaliser l'itinéraire
Step "8. Finalisation de l'itinéraire"
$finalizeBody = @{
    routeName = "Test Route Paris-Lyon"
    notes = "Route créée par le script de test PowerShell"
} | ConvertTo-Json

try {
    $finalizeResponse = Invoke-RestMethod -Uri "$BASE_URL/routes/finalize/$SESSION_ID" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $finalizeBody

    Success "Itinéraire finalisé"
} catch {
    Error "Échec de finalisation"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""

# 9. Supprimer l'itinéraire
Step "9. Suppression de l'itinéraire"
try {
    $deleteResponse = Invoke-RestMethod -Uri "$BASE_URL/routes/$SESSION_ID" `
        -Method Delete `
        -Headers $headers

    Success "Itinéraire supprimé"
} catch {
    Error "Échec de suppression"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✓ Tous les tests ont réussi!" -ForegroundColor Green
Write-Host ""
Write-Host "Résumé:"
Write-Host "  - Compte créé: $EMAIL"
Write-Host "  - Session ID: $SESSION_ID"
Write-Host "  - Itinéraire: Paris → Dijon → Mâcon → Lyon"
Write-Host "  - Operations: Init → 2x Add Waypoint → Get Status → Finalize → Delete"
Write-Host ""
