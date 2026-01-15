// src/routes/entities/route-session.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entité pour stocker les sessions d'itinéraires en cours de construction
 * Permet de conserver l'état entre les différents appels API
 */
@Entity('route_sessions')
export class RouteSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('jsonb')
  origin: {
    lat: number;
    lng: number;
    address?: string;
  };

  @Column('jsonb')
  destination: {
    lat: number;
    lng: number;
    address?: string;
  };

  @Column('jsonb', { default: [] })
  waypoints: Array<{
    lat: number;
    lng: number;
    address?: string;
  }>;

  @Column('jsonb', { nullable: true })
  lastComputedRoute: any; // Stocke le dernier résultat de Google Maps

  @Column('jsonb', { nullable: true })
  alternatives: any[]; // Routes alternatives

  @Column({ type: 'varchar', default: 'DRIVE' })
  travelMode: string; // DRIVE, BICYCLE, WALK, TWO_WHEELER

  @Column({ default: 'fr' })
  language: string;

  @Column({ default: false })
  provideAlternatives: boolean;

  @Column({ default: false })
  isFinalized: boolean; // Indique si l'itinéraire a été validé définitivement

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // Pour gérer l'expiration automatique
}
