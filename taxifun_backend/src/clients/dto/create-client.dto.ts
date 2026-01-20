import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
    @ApiProperty({ example: '+237670000000' })
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ example: 'Jean', required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ example: 'Dupont', required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ example: 'jean.dupont@email.com', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;
}