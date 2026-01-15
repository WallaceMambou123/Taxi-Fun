#!/bin/bash

# Script de test automatisé pour le module Routes
# Usage: ./test-routes.sh

set -e  # Arrêter en cas d'erreur

BASE_URL="http://localhost:3000"
EMAIL="test-driver-$(date +%s)@example.com"  # Email unique
PASSWORD="Test1234!"

echo "🚀 Début des tests du module Routes"
echo "=================================="
echo ""

# Couleurs pour les logs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

# Fonction pour afficher le succès
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Fonction pour afficher les erreurs
error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Enregistrement d'un nouveau compte
step "1. Création d'un compte chauffeur"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"role\":\"driver\"}")

if echo "$REGISTER_RESPONSE" | grep -q "email"; then
    success "Compte créé: $EMAIL"
else
    error "Échec de création du compte"
    echo "$REGISTER_RESPONSE"
    exit 1
fi

echo ""

# 2. Login
step "2. Connexion"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    error "Échec de connexion - Token non reçu"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

success "Connecté - Token reçu"
echo ""

# 3. Initialiser un itinéraire
step "3. Initialisation d'un itinéraire (Paris → Lyon)"
INIT_RESPONSE=$(curl -s -X POST "$BASE_URL/routes/init" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {
      "lat": 48.8566,
      "lng": 2.3522,
      "address": "Paris, France"
    },
    "destination": {
      "lat": 45.7640,
      "lng": 4.8357,
      "address": "Lyon, France"
    },
    "travelMode": "DRIVE",
    "provideAlternatives": true,
    "language": "fr"
  }')

SESSION_ID=$(echo "$INIT_RESPONSE" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
    error "Échec d'initialisation - Session ID non reçu"
    echo "$INIT_RESPONSE"
    exit 1
fi

success "Itinéraire initialisé - Session ID: $SESSION_ID"
echo ""

# 4. Ajouter un waypoint (Dijon)
step "4. Ajout d'un waypoint (Dijon)"
WAYPOINT1_RESPONSE=$(curl -s -X POST "$BASE_URL/routes/add-waypoint" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"newWaypoint\": {
      \"lat\": 47.3220,
      \"lng\": 5.0415,
      \"address\": \"Dijon, France\"
    }
  }")

WAYPOINTS_COUNT=$(echo "$WAYPOINT1_RESPONSE" | grep -o '"waypointsCount":[0-9]*' | cut -d':' -f2)

if [ "$WAYPOINTS_COUNT" = "1" ]; then
    success "Premier waypoint ajouté (Dijon)"
else
    error "Échec d'ajout du waypoint"
    echo "$WAYPOINT1_RESPONSE"
    exit 1
fi

echo ""

# 5. Ajouter un second waypoint (Mâcon)
step "5. Ajout d'un second waypoint (Mâcon)"
WAYPOINT2_RESPONSE=$(curl -s -X POST "$BASE_URL/routes/add-waypoint" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"newWaypoint\": {
      \"lat\": 46.3064,
      \"lng\": 4.8317,
      \"address\": \"Mâcon, France\"
    }
  }")

WAYPOINTS_COUNT=$(echo "$WAYPOINT2_RESPONSE" | grep -o '"waypointsCount":[0-9]*' | cut -d':' -f2)

if [ "$WAYPOINTS_COUNT" = "2" ]; then
    success "Second waypoint ajouté (Mâcon)"
else
    error "Échec d'ajout du second waypoint"
    echo "$WAYPOINT2_RESPONSE"
    exit 1
fi

echo ""

# 6. Récupérer l'état de l'itinéraire
step "6. Récupération de l'état de l'itinéraire"
STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/routes/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATUS_RESPONSE" | grep -q "currentRoute"; then
    success "État récupéré avec succès"

    # Extraire quelques informations
    DISTANCE=$(echo "$STATUS_RESPONSE" | grep -o '"text":"[0-9.]* km"' | head -1 | cut -d'"' -f4)
    if [ ! -z "$DISTANCE" ]; then
        echo "   Distance totale: $DISTANCE"
    fi
else
    error "Échec de récupération de l'état"
    echo "$STATUS_RESPONSE"
    exit 1
fi

echo ""

# 7. Récupérer les sessions actives
step "7. Récupération des sessions actives"
ACTIVE_RESPONSE=$(curl -s -X GET "$BASE_URL/routes/user/active" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ACTIVE_RESPONSE" | grep -q "$SESSION_ID"; then
    success "Sessions actives récupérées"
else
    error "Échec de récupération des sessions actives"
    echo "$ACTIVE_RESPONSE"
    exit 1
fi

echo ""

# 8. Finaliser l'itinéraire
step "8. Finalisation de l'itinéraire"
FINALIZE_RESPONSE=$(curl -s -X POST "$BASE_URL/routes/finalize/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "routeName": "Test Route Paris-Lyon",
    "notes": "Route créée par le script de test"
  }')

if echo "$FINALIZE_RESPONSE" | grep -q "currentRoute"; then
    success "Itinéraire finalisé"
else
    error "Échec de finalisation"
    echo "$FINALIZE_RESPONSE"
    exit 1
fi

echo ""

# 9. Supprimer l'itinéraire
step "9. Suppression de l'itinéraire"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/routes/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DELETE_RESPONSE" | grep -q "succès"; then
    success "Itinéraire supprimé"
else
    error "Échec de suppression"
    echo "$DELETE_RESPONSE"
    exit 1
fi

echo ""
echo "=================================="
echo -e "${GREEN}✓ Tous les tests ont réussi!${NC}"
echo ""
echo "Résumé:"
echo "  - Compte créé: $EMAIL"
echo "  - Session ID: $SESSION_ID"
echo "  - Itinéraire: Paris → Dijon → Mâcon → Lyon"
echo "  - Operations: Init → 2x Add Waypoint → Get Status → Finalize → Delete"
echo ""
