// src/routes/interfaces/route-response.interface.ts

/**
 * Interface pour une localisation dans les réponses
 */
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

/**
 * Interface pour une étape de l'itinéraire
 */
export interface RouteStep {
  instruction: string;
  distance: {
    meters: number;
    text: string;
  };
  duration: {
    seconds: number;
    text: string;
  };
  startLocation: Location;
  endLocation: Location;
  polyline: string;
}

/**
 * Interface pour une route calculée
 */
export interface ComputedRoute {
  polyline: string; // Polyline encodée de l'ensemble de la route
  distance: {
    meters: number;
    text: string;
  };
  duration: {
    seconds: number;
    text: string;
  };
  steps: RouteStep[];
  legs: Array<{
    distance: {
      meters: number;
      text: string;
    };
    duration: {
      seconds: number;
      text: string;
    };
    startLocation: Location;
    endLocation: Location;
    steps: RouteStep[];
  }>;
  warnings?: string[];
  travelAdvisory?: {
    tollInfo?: any;
    speedReadingIntervals?: any[];
  };
}

/**
 * Interface pour un point d'intérêt suggéré
 */
export interface SuggestedIntersection {
  lat: number;
  lng: number;
  description: string;
  distanceFromOrigin?: number; // en mètres
}

/**
 * Interface pour la réponse complète d'itinéraire
 */
export interface RouteResponse {
  sessionId: string;
  origin: Location;
  destination: Location;
  waypoints: Location[];
  currentRoute: ComputedRoute;
  alternatives?: ComputedRoute[];
  suggestedNextIntersections?: SuggestedIntersection[];
  metadata: {
    travelMode: string;
    language: string;
    computedAt: Date;
    waypointsCount: number;
  };
}
