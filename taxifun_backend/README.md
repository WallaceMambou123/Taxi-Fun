# 🚕 Taxi-Fun Backend

API REST pour plateforme de gestion de taxis avec construction manuelle d'itinéraires.

## 📋 Description

Backend NestJS pour l'application Taxi-Fun, permettant aux chauffeurs de:
- 🔐 S'authentifier via JWT
- 🗺️ Construire manuellement des itinéraires avec Google Maps
- 📍 Ajouter progressivement des waypoints
- 🔄 Recalculer automatiquement les routes à chaque modification
- 💾 Sauvegarder et gérer leurs sessions d'itinéraires

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- PostgreSQL 15+
- Clé API Google Maps (Directions API activée)

### Installation (5 minutes)

```bash
# 1. Installer les dépendances
npm install

# 2. Créer la base de données PostgreSQL
psql -U postgres
CREATE DATABASE taxifun_db;
\q

# 3. Configurer les variables d'environnement
# Éditer .env et ajouter:
# - GOOGLE_MAPS_API_KEY (obligatoire)
# - DB_PASSWORD (si différent de "postgres")

# 4. Démarrer l'application
npm run start:dev
```

L'API sera disponible sur http://localhost:3000

### Test Rapide

```bash
# Windows PowerShell
.\test-routes.ps1

# Linux/macOS
./test-routes.sh
```

## 📚 Documentation Complète

| Document | Description |
|----------|-------------|
| [🚀 QUICKSTART.md](QUICKSTART.md) | Guide de démarrage en 5 minutes |
| [📘 README_ROUTES.md](README_ROUTES.md) | Documentation complète du module Routes |
| [🏗️ ARCHITECTURE.md](ARCHITECTURE.md) | Architecture technique détaillée |
| [✅ IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) | Checklist d'implémentation |
| [📦 PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Résumé du projet |

## 🎯 Fonctionnalités

### Module d'Authentification
- ✅ Inscription utilisateur
- ✅ Connexion JWT
- ✅ Protection des routes

### Module Routes (🆕)
- ✅ Initialisation d'itinéraire (origin + destination)
- ✅ Ajout progressif de waypoints
- ✅ Recalcul automatique avec Google Maps
- ✅ Routes alternatives (jusqu'à 3)
- ✅ Suggestions intelligentes de waypoints
- ✅ Gestion de sessions temporaires
- ✅ 4 modes de transport (voiture, vélo, marche, deux-roues)

## 🛠️ Stack Technique

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL (TypeORM)
- **Auth**: JWT (Passport)
- **Validation**: class-validator
- **External API**: Google Maps Directions API

## 📁 Structure du Projet

```
src/
├── auth/              # Module d'authentification
│   ├── dto/
│   ├── entities/
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── jwt.strategy.ts
│
├── routes/            # Module de construction d'itinéraires
│   ├── dto/          # DTOs avec validation
│   ├── entities/     # Entités TypeORM
│   ├── interfaces/   # Interfaces TypeScript
│   ├── services/     # Services spécialisés
│   ├── routes.controller.ts
│   ├── routes.service.ts
│   └── routes.module.ts
│
└── app.module.ts     # Module racine
```

## 🔌 API Endpoints

### Authentification

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/auth/register` | POST | Créer un compte |
| `/auth/login` | POST | Se connecter |

### Routes (Protégées JWT)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/routes/init` | POST | Initialiser un itinéraire |
| `/routes/add-waypoint` | POST | Ajouter un waypoint |
| `/routes/:sessionId` | GET | Récupérer l'état |
| `/routes/finalize/:sessionId` | POST | Finaliser l'itinéraire |
| `/routes/user/active` | GET | Lister sessions actives |
| `/routes/:sessionId` | DELETE | Supprimer une session |

## 🔧 Configuration

### Variables d'Environnement (.env)

```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=taxifun_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Google Maps API
GOOGLE_MAPS_API_KEY=your_api_key_here

# Sessions
ROUTE_SESSION_TTL=3600
```

## 🧪 Tests

### Tests Automatisés

```bash
# Windows
.\test-routes.ps1

# Linux/macOS
./test-routes.sh
```

### Tests Manuels

Ouvrir `routes.http` dans VS Code avec l'extension REST Client.

### Tests Unitaires (à venir)

```bash
npm test
```

## 📖 Exemples d'Utilisation

### 1. Créer un Itinéraire

```bash
POST /routes/init
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
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
}
```

### 2. Ajouter un Waypoint

```bash
POST /routes/add-waypoint
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "newWaypoint": {
    "lat": 47.3220,
    "lng": 5.0415,
    "address": "Dijon"
  }
}
```

## 🔒 Sécurité

- ✅ Tous les endpoints routes protégés par JWT
- ✅ Validation stricte des entrées (class-validator)
- ✅ Protection SQL injection (TypeORM)
- ✅ Isolation des données par utilisateur
- ✅ Secrets en variables d'environnement

## 📊 Base de Données

### Tables Créées Automatiquement

- `users` - Utilisateurs authentifiés
- `route_sessions` - Sessions d'itinéraires temporaires

Le schéma est créé automatiquement avec `synchronize: true` (développement uniquement).

## 🚦 Scripts NPM

```bash
# Développement
npm run start:dev      # Démarrer en mode watch

# Production
npm run build          # Compiler TypeScript
npm run start:prod     # Démarrer en production

# Tests
npm test               # Tests unitaires
npm run test:e2e       # Tests end-to-end
npm run test:cov       # Coverage

# Qualité du Code
npm run lint           # Linter ESLint
npm run format         # Formatter Prettier
```

## 🐛 Debugging

### Vérifier PostgreSQL

```bash
psql -U postgres -l
psql -U postgres -d taxifun_db -c "\dt"
```

### Logs de l'Application

Les logs s'affichent dans le terminal où vous avez lancé `npm run start:dev`.

### Problèmes Courants

Voir [QUICKSTART.md](QUICKSTART.md) section "Problèmes Courants".

## 📦 Déploiement

### Checklist Production

- [ ] Désactiver `synchronize: true` dans TypeORM
- [ ] Configurer migrations TypeORM
- [ ] Utiliser gestionnaire de secrets (AWS Secrets Manager, etc.)
- [ ] Configurer HTTPS
- [ ] Configurer CORS
- [ ] Ajouter rate limiting
- [ ] Configurer logs centralisés
- [ ] Configurer monitoring
- [ ] Backups automatiques DB

## 🔄 Roadmap

### Version 1.0 (Actuelle)
- ✅ Authentification JWT
- ✅ Construction manuelle d'itinéraires
- ✅ Gestion de sessions

### Version 1.1 (Prochaine)
- 🔄 Tests unitaires complets
- 🔄 Tests E2E
- 🔄 Documentation Swagger
- 🔄 Migration Routes API v2

### Version 2.0 (Future)
- 📱 WebSockets (temps réel)
- 🗄️ Redis (cache performances)
- 📊 Analytics et statistiques
- 🌐 Multi-langue
- 📱 Support mobile optimisé

## 🤝 Contribution

Ce projet est en cours de développement. Pour contribuer:

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

[MIT License](LICENSE)

## 📧 Contact & Support

Pour toute question:
1. Consulter la [documentation complète](README_ROUTES.md)
2. Vérifier les [problèmes courants](QUICKSTART.md)
3. Ouvrir une issue GitHub

## 🙏 Remerciements

- [NestJS](https://nestjs.com/) - Framework backend
- [Google Maps Platform](https://developers.google.com/maps) - API de routage
- [TypeORM](https://typeorm.io/) - ORM pour PostgreSQL
- [PostgreSQL](https://www.postgresql.org/) - Base de données

---

**Built with ❤️ using NestJS, TypeScript, and Google Maps API**

*Status: ✅ Fully Implemented - Ready for Development*
