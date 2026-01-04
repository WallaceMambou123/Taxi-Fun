import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride, RideStatus } from './entities/ride.entity';
import { CreateRideDto } from './dto/create-ride.dto';
import { UserRole } from '../auth/entities/user.entity';

@Injectable()
export class RideService {
  constructor(
    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,
  ) {}

  async createRide(createRideDto: CreateRideDto, clientId: number) {
    const ride = this.rideRepository.create({
      ...createRideDto,
      clientId,
      status: RideStatus.PENDING,
    });

    return this.rideRepository.save(ride);
  }

  async getAvailableRides() {
    return this.rideRepository.find({
      where: { status: RideStatus.PENDING },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async acceptRide(rideId: number, driverId: number) {
  const ride = await this.rideRepository.findOne({
    where: { id: rideId, status: RideStatus.PENDING },
  });

  if (!ride) {
    throw new NotFoundException('Course non trouvée ou déjà acceptée');
  }

  ride.driverId = driverId;
  ride.status = RideStatus.ACCEPTED;

  return this.rideRepository.save(ride);
}

  // On ajoutera plus tard : acceptRide(driverId, rideId), completeRide, etc.
}