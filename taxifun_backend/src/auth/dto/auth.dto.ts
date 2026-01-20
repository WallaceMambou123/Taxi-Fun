import { IsString, IsNotEmpty, IsPhoneNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Enum pour savoir dans quelle table chercher
export enum UserRole {
    CLIENT = 'CLIENT',
    DRIVER = 'DRIVER',
    ADMIN = 'ADMIN'
}

export class RequestOtpDto {
    @ApiProperty({ example: '+237699000000' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole;
}

export class VerifyOtpDto {
    @ApiProperty({ example: '+237699000000' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ example: '1234' })
    @IsString()
    @IsNotEmpty()
    otpCode: string;

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole;
}