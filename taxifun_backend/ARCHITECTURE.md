# Architecture du Module Routes - Taxi-Fun Backend

## Vue d'Ensemble

Le module Routes implémente un système de construction manuelle d'itinéraires pour chauffeurs, utilisant Google Maps Platform pour le calcul des routes.

## Architecture en Couches

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                     │
│              (React, Vue, Angular, etc.)                 │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST + JWT
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   CONTROLLER LAYER                       │
│                  RoutesController                        │
│    ┌──────────┬──────────┬──────────┬──────────┐       │
│    │ POST     │ POST     │ GET      │ POST     │       │
│    │ /init    │ /waypoint│ /:id     │ /finalize│       │
│    └──────────┴──────────┴──────────┴──────────┘       │
└───────────────────────┬─────────────────────────────────┘
                        │ DTOs validés
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                          │
│                    RoutesService                         │
│         (Orchestration de la logique métier)             │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
    ┌──────────────────┐    ┌──────────────────┐
    │ GoogleMapsService│    │RouteSessionService│
    │                  │    │                  │
    │ - computeRoutes()│    │ - createSession()│
    │ - extractSuggested│    │ - addWaypoint() │
    │   Intersections()│    │ - getSession()  │
    └────────┬─────────┘    └─────────┬────────┘
             │                        │
             ▼                        ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  Google Maps API │    │   PostgreSQL     │
    │  (Directions)    │    │  (route_sessions)│
    └──────────────────┘    └──────────────────┘
```

## Structure des Fichiers

```
src/
├── auth/                          # Module d'authentification (existant)
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── ...
│
├── routes/                        # Module Routes (nouveau)
│   ├── dto/                       # Data Transfer Objects
│   │   ├── location.dto.ts        # { lat, lng, address? }
│   │   ├── route-init.dto.ts      # Origin + Destination + Options
│   │   ├── add-waypoint.dto.ts    # SessionId + NewWaypoint
│   │   └── finalize-route.dto.ts  # Métadonnées finales
│   │
│   ├── entities/                  # Entités TypeORM
│   │   └── route-session.entity.ts # Table route_sessions
│   │
│   ├── interfaces/                # Interfaces TypeScript
│   │   └── route-response.interface.ts
│   │
│   ├── services/                  # Services spécialisés
│   │   ├── google-maps.service.ts # Intégration Google Maps
│   │   └── route-session.service.ts # Gestion sessions DB
│   │
│   ├── routes.controller.ts       # Endpoints REST
│   ├── routes.service.ts          # Logique métier
│   ├── routes.module.ts           # Module NestJS
│   └── index.ts                   # Exports centralisés
│
├── app.module.ts                  # Module racine
└── main.ts                        # Point d'entrée
```

## Flux de Données Détaillé

### 1. Initialisation d'Itinéraire

```
Client → POST /routes/init
         │
         ├─ [RoutesController]
         │   ├─ Validation JWT (AuthGuard)
         │   └─ Validation DTO (ValidationPipe)
         │
         ├─ [RoutesService.initializeRoute()]
         │   │
         │   ├─ [RouteSessionService.createSession()]
         │   │   └─ INSERT INTO route_sessions (...)
         │   │
         │   ├─ [GoogleMapsService.computeRoutes()]
         │   │   └─ Google Directions API Call
         │   │       └─ Returns: { mainRoute, alternatives }
         │   │
         │   ├─ [GoogleMapsService.extractSuggestedIntersections()]
         │   │   └─ Analyse des steps pour suggérer waypoints
         │   │
         │   └─ [RouteSessionService.updateSession()]
         │       └─ UPDATE route_sessions SET lastComputedRoute = ...
         │
         └─ Response: RouteResponse avec sessionId
```

### 2. Ajout de Waypoint

```
Client → POST /routes/add-waypoint
         │
         ├─ [RoutesController]
         │   └─ Validation + Auth
         │
         ├─ [RoutesService.addWaypoint()]
         │   │
         │   ├─ [RouteSessionService.getSession()]
         │   │   └─ SELECT * FROM route_sessions WHERE id = ...
         │   │
         │   ├─ [RouteSessionService.addWaypoint()]
         │   │   └─ UPDATE waypoints array
         │   │
         │   ├─ [GoogleMapsService.computeRoutes()]
         │   │   └─ Recalcul avec TOUS les waypoints
         │   │
         │   └─ [RouteSessionService.updateSession()]
         │       └─ Sauvegarde nouvelle route
         │
         └─ Response: RouteResponse mise à jour
```

## Modèle de Données

### Entity: RouteSession

```typescript
{
  id: UUID (PK),
  userId: string,
  origin: {
    lat: number,
    lng: number,
    address?: string
  },
  destination: { ... },
  waypoints: [
    { lat, lng, address? },
    ...
  ],
  lastComputedRoute: {
    polyline: string,
    distance: { meters, text },
    duration: { seconds, text },
    steps: [...],
    legs: [...]
  },
  alternatives: [ ... ],
  travelMode: 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER',
  language: string,
  provideAlternatives: boolean,
  isFinalized: boolean,
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date
}
```

### Table PostgreSQL

```sql
CREATE TABLE route_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId VARCHAR NOT NULL,
  origin JSONB NOT NULL,
  destination JSONB NOT NULL,
  waypoints JSONB DEFAULT '[]',
  lastComputedRoute JSONB,
  alternatives JSONB,
  travelMode VARCHAR DEFAULT 'DRIVE',
  language VARCHAR DEFAULT 'fr',
  provideAlternatives BOOLEAN DEFAULT false,
  isFinalized BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  expiresAt TIMESTAMP
);

CREATE INDEX idx_route_sessions_userId ON route_sessions(userId);
CREATE INDEX idx_route_sessions_expiresAt ON route_sessions(expiresAt);
CREATE INDEX idx_route_sessions_isFinalized ON route_sessions(isFinalized);
```

## Patterns de Conception

### 1. Dependency Injection (NestJS)

Tous les services sont injectés via le constructeur:

```typescript
constructor(
  private readonly googleMapsService: GoogleMapsService,
  private readonly routeSessionService: RouteSessionService,
) {}
```

### 2. Repository Pattern (TypeORM)

Accès à la base de données via TypeORM Repository:

```typescript
@InjectRepository(RouteSession)
private readonly routeSessionRepository: Repository<RouteSession>
```

### 3. DTO Pattern

Validation stricte des entrées avec class-validator:

```typescript
export class LocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;
  // ...
}
```

### 4. Service Layer Pattern

Séparation claire des responsabilités:
- **Controller**: Gestion HTTP, validation, auth
- **Service**: Logique métier
- **Specialized Services**: Intégrations externes (Google Maps, DB)

### 5. Error Handling

Utilisation des exceptions NestJS:

```typescript
throw new BadRequestException('Message clair');
throw new NotFoundException('Ressource introuvable');
throw new InternalServerErrorException('Erreur serveur');
```

## Sécurité

### 1. Authentification JWT

Tous les endpoints sont protégés:

```typescript
@Controller('routes')
@UseGuards(AuthGuard('jwt'))
export class RoutesController { ... }
```

### 2. Validation des Entrées

DTOs avec class-validator pour prévenir:
- Injection SQL (via TypeORM parameterized queries)
- Coordonnées invalides (validation lat/lng)
- UUID malformés

### 3. Isolation des Données

Les sessions sont isolées par userId:

```typescript
async getSession(sessionId: string, userId: string) {
  return this.repository.findOne({
    where: { id: sessionId, userId }
  });
}
```

### 4. Limitation des Coûts

- Cache des routes en DB
- Limitation à 3 alternatives max
- Expiration automatique des sessions

## Performance

### 1. Caching

Routes calculées stockées en JSONB dans PostgreSQL:
- Évite les recalculs inutiles
- Accès rapide via indexes

### 2. Batch Operations

Pas de N+1 queries grâce à TypeORM:
```typescript
await this.repository.find({ where: { userId } });
```

### 3. Async/Await

Toutes les opérations I/O sont asynchrones:
```typescript
async computeRoutes(...): Promise<RouteResult> { ... }
```

### 4. Cleanup Automatique

Tâche cron pour supprimer les sessions expirées:
```typescript
@Cron(CronExpression.EVERY_HOUR)
async cleanupExpiredSessions() { ... }
```

## Évolutivité

### Améliorations Possibles

1. **Redis pour les Sessions**
   - Plus rapide que PostgreSQL pour données temporaires
   - TTL natif
   - Pub/Sub pour notifications temps réel

2. **Message Queue**
   - Calculs asynchrones dans une queue (RabbitMQ, Bull)
   - Retry automatique en cas d'échec

3. **Microservices**
   - Séparer GoogleMapsService en microservice dédié
   - API Gateway pour routing

4. **WebSockets**
   - Notifications temps réel des changements de trafic
   - Mise à jour live de la route

5. **GraphQL**
   - Remplacer REST par GraphQL
   - Subscriptions pour temps réel

## Monitoring

### Logs Structurés

```typescript
this.logger.log(`Computing route for user ${userId}`);
this.logger.error('Google Maps API error', error);
```

### Métriques Suggérées

- Nombre de sessions créées/jour
- Temps moyen de calcul de route
- Taux d'erreur Google Maps API
- Nombre de sessions expirées nettoyées

## Tests

### Structure de Tests Recommandée

```
src/routes/
├── __tests__/
│   ├── routes.controller.spec.ts
│   ├── routes.service.spec.ts
│   ├── google-maps.service.spec.ts
│   └── route-session.service.spec.ts
│
└── __e2e__/
    └── routes.e2e-spec.ts
```

### Scripts de Test

- `test-routes.sh` (Bash/Linux/macOS)
- `test-routes.ps1` (PowerShell/Windows)

## Documentation API

Pour générer la documentation Swagger:

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Taxi-Fun API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

Accès: http://localhost:3000/api/docs

## Déploiement

### Variables d'Environnement Requises

```
DB_HOST
DB_PORT
DB_USERNAME
DB_PASSWORD
DB_DATABASE
JWT_SECRET
GOOGLE_MAPS_API_KEY
ROUTE_SESSION_TTL
```

### Checklist Production

- [ ] `synchronize: false` dans TypeORM
- [ ] Migrations TypeORM configurées
- [ ] Secrets dans un gestionnaire (AWS Secrets Manager, etc.)
- [ ] Logs centralisés (CloudWatch, Datadog)
- [ ] Monitoring (Prometheus, Grafana)
- [ ] Rate limiting (throttler)
- [ ] CORS configuré
- [ ] HTTPS activé
- [ ] Backup DB automatique

## Ressources

- [Documentation NestJS](https://docs.nestjs.com/)
- [Google Directions API](https://developers.google.com/maps/documentation/directions)
- [TypeORM](https://typeorm.io/)
- [class-validator](https://github.com/typestack/class-validator)
