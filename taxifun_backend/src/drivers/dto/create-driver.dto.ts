import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDriverDto {
    @ApiProperty({ example: '+237699000000' })
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ example: 'LT 123 AA', required: false })
    @IsOptional()
    @IsString()
    taxiPlate?: string;

    @ApiProperty({ example: 'P1234567', required: false })
    @IsOptional()
    @IsString()
    licenseNumber?: string;
}