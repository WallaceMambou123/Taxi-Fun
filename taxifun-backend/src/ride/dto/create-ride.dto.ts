import { IsString, IsNumber, Min } from 'class-validator';

export class CreateRideDto {
  @IsString()
  pickupAddress: string;

  @IsString()
  dropoffAddress: string;

  @IsNumber()
  @Min(0)
  estimatedPrice: number;
}