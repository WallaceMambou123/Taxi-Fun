# Guide de Démarrage Rapide - Taxi-Fun Backend

## Configuration Initiale (5 minutes)

### 1. Installer PostgreSQL (si pas déjà fait)

**Windows:**
- Télécharger depuis https://www.postgresql.org/download/windows/
- Installer avec les paramètres par défaut
- Mot de passe suggéré pour l'utilisateur `postgres`: `postgres`

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Créer la Base de Données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Dans le shell PostgreSQL:
CREATE DATABASE taxifun_db;

# Vérifier
\l

# Quitter
\q
```

### 3. Configurer les Variables d'Environnement

Le fichier `.env` est déjà configuré avec des valeurs par défaut. **Modifiez seulement:**

```env
# Changez si votre mot de passe PostgreSQL est différent
DB_PASSWORD=votre_mot_de_passe_postgres

# OBLIGATOIRE: Ajoutez votre clé API Google Maps
GOOGLE_MAPS_API_KEY=AIzaSy...votre_vraie_clé

# Recommandé: Changez le secret JWT en production
JWT_SECRET=un_secret_vraiment_secret_et_long
```

### 4. Obtenir une Clé API Google Maps

1. Aller sur https://console.cloud.google.com/
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer les APIs:
   - **Directions API** (obligatoire)
   - **Geocoding API** (recommandé)
4. Créer une clé API dans "Identifiants"
5. Copier la clé dans `.env`

⚠️ **Important**: Pour le développement, vous pouvez restreindre la clé:
- Type: Clé API
- Restrictions d'API: Directions API, Geocoding API
- (Pas de restriction d'IP pour localhost)

### 5. Installer et Démarrer

```bash
# Installer les dépendances (déjà fait)
npm install

# Démarrer en mode développement
npm run start:dev
```

Vous devriez voir:
```
[Nest] INFO  Listening on http://localhost:3000
```

## Premier Test (2 minutes)

### 1. Créer un Compte Chauffeur

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "role": "driver"
  }'
```

### 2. Se Connecter

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

Copiez le `access_token` retourné.

### 3. Créer un Itinéraire

```bash
# Remplacez YOUR_TOKEN par le token obtenu à l'étape 2
curl -X POST http://localhost:3000/routes/init \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {
      "lat": 48.8566,
      "lng": 2.3522,
      "address": "Paris"
    },
    "destination": {
      "lat": 45.7640,
      "lng": 4.8357,
      "address": "Lyon"
    },
    "travelMode": "DRIVE",
    "provideAlternatives": true
  }'
```

Vous devriez recevoir une réponse avec:
- `sessionId`: ID de la session d'itinéraire
- `currentRoute`: Route calculée avec polyline, distance, durée
- `alternatives`: Routes alternatives (si demandées)
- `suggestedNextIntersections`: Suggestions de prochains waypoints

## Utiliser Postman ou REST Client

### Option 1: REST Client (VS Code)

1. Installer l'extension "REST Client" dans VS Code
2. Ouvrir le fichier `routes.http`
3. Remplacer `@token` par votre JWT
4. Cliquer sur "Send Request" au-dessus de chaque requête

### Option 2: Postman

1. Importer la collection depuis le fichier `routes.http` (ou créer manuellement)
2. Ajouter le token dans l'onglet "Authorization" > "Bearer Token"
3. Exécuter les requêtes

## Flux Typique d'Utilisation

```
1. Login → Récupérer le JWT
2. POST /routes/init → Créer l'itinéraire avec origine/destination
3. POST /routes/add-waypoint → Ajouter un waypoint (répéter si besoin)
4. GET /routes/:sessionId → Consulter l'état actuel
5. POST /routes/finalize/:sessionId → Finaliser l'itinéraire
```

## Vérifications de Bon Fonctionnement

### Base de Données
```bash
# Vérifier que les tables sont créées
psql -U postgres -d taxifun_db -c "\dt"
```

Vous devriez voir:
- `users`
- `route_sessions`

### Logs
Dans votre terminal où `npm run start:dev` tourne, vous devriez voir:
```
[RoutesService] Initializing route for user...
[GoogleMapsService] Computing route from [48.8566,2.3522] to [45.764,4.8357]...
[GoogleMapsService] Successfully computed 1 route(s)
```

## Problèmes Courants

### ❌ "connect ECONNREFUSED 127.0.0.1:5432"
**Solution**: PostgreSQL n'est pas démarré
```bash
# Windows (Services)
# Chercher "postgresql" dans les services Windows et démarrer

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### ❌ "REQUEST_DENIED" de Google Maps
**Solution**: Clé API invalide ou APIs non activées
1. Vérifier que la clé est correcte dans `.env`
2. Activer Directions API dans Google Cloud Console
3. Attendre 5 minutes pour la propagation

### ❌ "password authentication failed for user postgres"
**Solution**: Mot de passe incorrect
- Modifier `DB_PASSWORD` dans `.env`
- Ou réinitialiser le mot de passe PostgreSQL

### ❌ Port 3000 déjà utilisé
**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

## Prochaines Étapes

1. **Frontend**: Intégrer avec Google Maps JavaScript API pour afficher les routes
2. **Tests**: Tester tous les endpoints avec différents scénarios
3. **Production**:
   - Désactiver `synchronize: true` dans `app.module.ts`
   - Utiliser des migrations TypeORM
   - Restreindre la clé API Google Maps par IP
   - Utiliser des secrets sécurisés pour JWT_SECRET

## Documentation Complète

Voir [README_ROUTES.md](./README_ROUTES.md) pour la documentation détaillée.

## Support

En cas de problème:
1. Vérifier les logs dans le terminal
2. Vérifier que PostgreSQL et l'API Google Maps fonctionnent
3. Consulter la documentation Google Maps: https://developers.google.com/maps/documentation/directions
