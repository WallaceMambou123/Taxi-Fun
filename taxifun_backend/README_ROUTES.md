# Module de Construction Manuelle d'Itinéraires

## Vue d'ensemble

Ce module permet aux chauffeurs authentifiés de construire manuellement des itinéraires en ajoutant progressivement des waypoints intermédiaires. À chaque ajout, l'API recalcule automatiquement les routes possibles en utilisant Google Maps Platform.

## Architecture

### Structure du Module

```
src/routes/
├── dto/
│   ├── location.dto.ts           # DTO pour représenter une position GPS
│   ├── route-init.dto.ts         # DTO pour initialiser un nouvel itinéraire
│   ├── add-waypoint.dto.ts       # DTO pour ajouter un waypoint
│   └── finalize-route.dto.ts     # DTO pour finaliser un itinéraire
├── entities/
│   └── route-session.entity.ts   # Entité pour stocker les sessions en DB
├── interfaces/
│   └── route-response.interface.ts # Interfaces pour les réponses formatées
├── services/
│   ├── google-maps.service.ts    # Service pour appeler Google Maps API
│   └── route-session.service.ts  # Service pour gérer les sessions
├── routes.controller.ts          # Contrôleur REST
├── routes.service.ts             # Service métier principal
└── routes.module.ts              # Module NestJS
```

## Configuration

### Variables d'Environnement (.env)

```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=taxifun_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Session TTL (en secondes)
ROUTE_SESSION_TTL=3600
```

⚠️ **Important**: Remplacez `GOOGLE_MAPS_API_KEY` par votre vraie clé API Google Maps.

### Prérequis

1. PostgreSQL installé et en cours d'exécution
2. Base de données créée: `taxifun_db`
3. Clé API Google Maps avec les APIs suivantes activées:
   - Directions API
   - (Optionnel) Routes API v2

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer PostgreSQL (si pas déjà fait)
# Sous Windows avec PostgreSQL installé:
# Le service devrait démarrer automatiquement

# Créer la base de données
psql -U postgres
CREATE DATABASE taxifun_db;
\q

# Démarrer l'application en mode développement
npm run start:dev
```

## API Endpoints

Tous les endpoints sont protégés par JWT (`@UseGuards(AuthGuard('jwt'))`).

### 1. Initialiser un itinéraire

**POST** `/routes/init`

Démarre un nouvel itinéraire avec un point de départ et une destination.

**Body:**
```json
{
  "origin": {
    "lat": 48.8566,
    "lng": 2.3522,
    "address": "Paris, France"
  },
  "destination": {
    "lat": 48.5734,
    "lng": 7.7521,
    "address": "Strasbourg, France"
  },
  "travelMode": "DRIVE",
  "provideAlternatives": true,
  "language": "fr"
}
```

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "origin": { "lat": 48.8566, "lng": 2.3522, "address": "Paris, France" },
  "destination": { "lat": 48.5734, "lng": 7.7521, "address": "Strasbourg, France" },
  "waypoints": [],
  "currentRoute": {
    "polyline": "encoded_polyline_string",
    "distance": { "meters": 488000, "text": "488.0 km" },
    "duration": { "seconds": 17280, "text": "4h 48min" },
    "steps": [...]
  },
  "alternatives": [...],
  "suggestedNextIntersections": [
    {
      "lat": 48.8234,
      "lng": 2.5689,
      "description": "Prendre la sortie vers A4",
      "distanceFromOrigin": 12500
    }
  ],
  "metadata": {
    "travelMode": "DRIVE",
    "language": "fr",
    "computedAt": "2026-01-15T10:30:00Z",
    "waypointsCount": 0
  }
}
```

### 2. Ajouter un waypoint

**POST** `/routes/add-waypoint`

Ajoute un waypoint intermédiaire et recalcule l'itinéraire.

**Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "newWaypoint": {
    "lat": 48.6921,
    "lng": 6.1844,
    "address": "Nancy, France"
  }
}
```

**Response:** Même structure que `/routes/init` avec le waypoint ajouté dans le tableau `waypoints`.

### 3. Récupérer l'état d'un itinéraire

**GET** `/routes/:sessionId`

Récupère l'état actuel d'un itinéraire en construction.

**Response:** Même structure que `/routes/init`.

### 4. Finaliser un itinéraire

**POST** `/routes/finalize/:sessionId`

Valide l'itinéraire final et prolonge son expiration à 24h.

**Body (optionnel):**
```json
{
  "notes": "Itinéraire pour la livraison du 15 janvier",
  "routeName": "Paris-Strasbourg via Nancy"
}
```

**Response:** État final de l'itinéraire.

### 5. Récupérer les sessions actives

**GET** `/routes/user/active`

Retourne toutes les sessions d'itinéraires actives (non finalisées) de l'utilisateur.

### 6. Supprimer un itinéraire

**DELETE** `/routes/:sessionId`

Supprime une session d'itinéraire.

**Response:**
```json
{
  "message": "Itinéraire supprimé avec succès",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Modes de Transport Supportés

- `DRIVE` (défaut): Voiture
- `BICYCLE`: Vélo
- `WALK`: Marche
- `TWO_WHEELER`: Deux-roues motorisé

## Gestion des Sessions

### Expiration
- Sessions actives: 1 heure par défaut (configurable via `ROUTE_SESSION_TTL`)
- Sessions finalisées: 24 heures
- Nettoyage automatique: Tâche cron toutes les heures

### Stockage
Les sessions sont stockées en base de données PostgreSQL avec:
- `origin`, `destination`, `waypoints`: Stockés en JSONB
- `lastComputedRoute`, `alternatives`: Cache des derniers calculs
- Timestamps automatiques (`createdAt`, `updatedAt`, `expiresAt`)

## Optimisation des Coûts Google Maps

Le service utilise plusieurs stratégies pour minimiser les coûts:

1. **Cache des routes**: Les routes calculées sont stockées en DB
2. **Limitation des alternatives**: Maximum 3 routes alternatives
3. **Réutilisation des sessions**: Pas de recalcul si la session existe déjà

### Coûts estimés (tarifs 2026)

- Directions API: ~$5 par 1000 requêtes
- Avec alternatives: ~$10 par 1000 requêtes (compte 2x)

## Gestion des Erreurs

Le module gère proprement les erreurs Google Maps:

- `INVALID_REQUEST`: BadRequestException (400)
- `ZERO_RESULTS`: BadRequestException (400)
- `OVER_QUERY_LIMIT`: InternalServerErrorException (500)
- `REQUEST_DENIED`: InternalServerErrorException (500)

## Exemple d'Utilisation Client

```javascript
// 1. Se connecter et obtenir le JWT
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'driver@example.com', password: 'password' })
});
const { access_token } = await loginResponse.json();

// 2. Initialiser un itinéraire
const initResponse = await fetch('http://localhost:3000/routes/init', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    origin: { lat: 48.8566, lng: 2.3522 },
    destination: { lat: 48.5734, lng: 7.7521 },
    provideAlternatives: true
  })
});
const { sessionId, currentRoute } = await initResponse.json();

// 3. Ajouter un waypoint
const waypointResponse = await fetch('http://localhost:3000/routes/add-waypoint', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId,
    newWaypoint: { lat: 48.6921, lng: 6.1844 }
  })
});
const updatedRoute = await waypointResponse.json();

// 4. Finaliser l'itinéraire
const finalizeResponse = await fetch(`http://localhost:3000/routes/finalize/${sessionId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    routeName: 'Mon itinéraire personnalisé'
  })
});
```

## Tests

Pour tester rapidement avec curl:

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"driver@example.com","password":"password"}' \
  | jq -r '.access_token')

# 2. Initialiser un itinéraire
curl -X POST http://localhost:3000/routes/init \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"lat": 48.8566, "lng": 2.3522},
    "destination": {"lat": 48.5734, "lng": 7.7521},
    "provideAlternatives": true
  }'
```

## Améliorations Futures

1. **Routes API v2**: Migration vers la nouvelle API pour des fonctionnalités avancées
2. **Redis**: Utiliser Redis au lieu de PostgreSQL pour les sessions temporaires
3. **WebSockets**: Notifications en temps réel des changements de trafic
4. **Optimisation d'ordre**: Algorithme pour optimiser l'ordre des waypoints
5. **Export**: Export des itinéraires en GPX/KML
6. **Historique**: Sauvegarde permanente des itinéraires finalisés

## Support

Pour toute question ou problème:
1. Vérifier les logs de l'application
2. Vérifier que PostgreSQL est bien démarré
3. Vérifier que la clé API Google Maps est valide et a les bonnes permissions
