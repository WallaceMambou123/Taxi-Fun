# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-15

### ✨ Ajouté

#### Module Routes (Nouveau)
- Endpoint POST `/routes/init` - Initialisation d'itinéraire avec origin/destination
- Endpoint POST `/routes/add-waypoint` - Ajout progressif de waypoints
- Endpoint GET `/routes/:sessionId` - Récupération de l'état d'un itinéraire
- Endpoint POST `/routes/finalize/:sessionId` - Finalisation d'itinéraire
- Endpoint GET `/routes/user/active` - Liste des sessions actives
- Endpoint DELETE `/routes/:sessionId` - Suppression de session

#### Fonctionnalités Routes
- Intégration Google Maps Directions API
- Calcul de routes avec jusqu'à 3 alternatives
- Support de 4 modes de transport (DRIVE, BICYCLE, WALK, TWO_WHEELER)
- Suggestions intelligentes de waypoints basées sur les intersections importantes
- Gestion de sessions temporaires avec expiration automatique
- Nettoyage automatique des sessions expirées (tâche cron horaire)
- Stockage en PostgreSQL avec JSONB pour flexibilité

#### DTOs avec Validation
- `LocationDto` - Validation stricte des coordonnées GPS (-90 à 90, -180 à 180)
- `RouteInitDto` - Validation de l'initialisation avec options avancées
- `AddWaypointDto` - Validation UUID et waypoint
- `FinalizeRouteDto` - Métadonnées de finalisation

#### Entités
- `RouteSession` - Entité TypeORM pour sessions d'itinéraires avec JSONB

#### Services
- `GoogleMapsService` - Service d'intégration Google Maps avec gestion d'erreurs complète
- `RouteSessionService` - Service de gestion des sessions avec TTL et cleanup
- `RoutesService` - Service métier orchestrant la logique d'itinéraires

#### Documentation
- `README_ROUTES.md` - Documentation complète du module Routes
- `QUICKSTART.md` - Guide de démarrage rapide en 5 minutes
- `ARCHITECTURE.md` - Documentation architecture détaillée
- `IMPLEMENTATION_COMPLETE.md` - Checklist d'implémentation
- `PROJECT_SUMMARY.md` - Résumé du projet
- `routes.http` - Exemples de requêtes REST Client

#### Tests
- `test-routes.sh` - Script de test automatisé Bash
- `test-routes.ps1` - Script de test automatisé PowerShell

### 🔧 Modifié

#### Configuration
- Migration de MySQL vers PostgreSQL
- Ajout de variables d'environnement:
  - `GOOGLE_MAPS_API_KEY`
  - `ROUTE_SESSION_TTL`
  - Configuration PostgreSQL (DB_HOST, DB_PORT, etc.)

#### Dépendances
- Ajout de `pg` - Driver PostgreSQL
- Ajout de `@googlemaps/google-maps-services-js` - Client Google Maps officiel
- Ajout de `@nestjs/schedule` - Support des tâches cron
- Ajout de `uuid` et `@types/uuid` - Génération UUID
- Remplacement de `mysql2` par `pg`

#### Modules
- `app.module.ts` - Ajout du RoutesModule et configuration PostgreSQL
- `README.md` - Mise à jour complète avec nouvelles fonctionnalités

### 🔒 Sécurité

- Tous les endpoints routes protégés par JWT via AuthGuard
- Validation stricte des entrées avec class-validator
- Protection SQL injection via TypeORM parameterized queries
- Isolation des données par userId
- Validation des coordonnées GPS pour prévenir les injections

### 📈 Performance

- Cache des routes calculées en base de données (JSONB)
- Indexes PostgreSQL sur userId et expiresAt
- Limitation à 3 routes alternatives max pour optimiser coûts API
- Nettoyage automatique des sessions expirées
- Opérations asynchrones partout (async/await)

### 🐛 Corrections

- Correction des types TypeScript pour compatibilité Google Maps client
- Gestion propre des erreurs Google Maps API:
  - `INVALID_REQUEST` → BadRequestException
  - `ZERO_RESULTS` → BadRequestException
  - `OVER_QUERY_LIMIT` → InternalServerErrorException
  - `REQUEST_DENIED` → InternalServerErrorException

### 📊 Statistiques

- 18 nouveaux fichiers créés
- ~2000 lignes de code TypeScript
- 6 endpoints REST
- 4 DTOs avec validation
- 3 services métier
- 5 fichiers de documentation
- 2 scripts de tests automatisés

## [0.1.0] - Date précédente

### ✨ Ajouté

#### Module d'Authentification (Base)
- Endpoint POST `/auth/register` - Inscription utilisateur
- Endpoint POST `/auth/login` - Connexion avec JWT
- Stratégie JWT avec Passport
- Entité User avec TypeORM
- Hashing de mots de passe avec bcrypt

#### Configuration Initiale
- Configuration NestJS 11
- Configuration TypeScript 5.7
- Configuration ESLint et Prettier
- Configuration Jest pour tests

---

## Types de Changements

- `✨ Ajouté` - Nouvelles fonctionnalités
- `🔧 Modifié` - Changements dans des fonctionnalités existantes
- `🗑️ Déprécié` - Fonctionnalités bientôt supprimées
- `🔥 Supprimé` - Fonctionnalités supprimées
- `🐛 Corrections` - Corrections de bugs
- `🔒 Sécurité` - Correctifs de vulnérabilités
- `📈 Performance` - Améliorations de performance
- `📚 Documentation` - Modifications de documentation

---

[1.0.0]: https://github.com/votre-repo/taxifun-backend/releases/tag/v1.0.0
[0.1.0]: https://github.com/votre-repo/taxifun-backend/releases/tag/v0.1.0
