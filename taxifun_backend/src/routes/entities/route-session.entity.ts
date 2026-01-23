/**
 * Route Session Entity
 * Représente une session de création/modification d'itinéraire
 * Note: Avec Prisma, les données sont stockées en cache en mémoire ou via Redis
 */
export class RouteSessionEntity {
  id: string;
  userId: string;
  origin: {
    lat: number;
    lng: number;
    address?: string;
  };
  destination: {
    lat: number;
    lng: number;
    address?: string;
  };
  waypoints: Array<{
    lat: number;
    lng: number;
    address?: string;
  }>;
  lastComputedRoute?: any;
  alternatives?: any[];
  travelMode: string;
  language: string;
  provideAlternatives: boolean;
  isFinalized: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
