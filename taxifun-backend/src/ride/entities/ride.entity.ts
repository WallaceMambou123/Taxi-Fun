import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum RideStatus {
  PENDING = 'pending',      // En attente d’un driver
  ACCEPTED = 'accepted',    // Acceptée par un driver
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('rides')
export class Ride {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pickupAddress: string;    // Adresse de départ

  @Column()
  dropoffAddress: string;   // Adresse d’arrivée

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  estimatedPrice: number;   // Prix estimé

  @Column({ type: 'enum', enum: RideStatus, default: RideStatus.PENDING })
  status: RideStatus;

  @ManyToOne(() => User, { nullable: false })
  client: User;             // Le client qui commande

  @Column({ nullable: true })
  clientId: number;

  @ManyToOne(() => User, { nullable: true })
  driver?: User;            // Le driver qui accepte (optionnel tant que pas accepté)

  @Column({ nullable: true })
  driverId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}