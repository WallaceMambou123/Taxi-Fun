import { IsEmail, IsString, IsEnum, IsOptional, Matches } from 'class-validator';
import { UserRole } from '../entities/user.entity';
export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString()
  // Correction ici : on utilise .* à la fin pour accepter les symboles
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, { 
    message: 'Mot de passe faible (min 8 chars, au moins 1 lettre et 1 chiffre)' 
  })
  password: string;

  @IsEnum(UserRole, { message: 'Rôle invalide' })
  role: UserRole;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, { message: 'Numéro de téléphone invalide' })
  phone?: string;
}