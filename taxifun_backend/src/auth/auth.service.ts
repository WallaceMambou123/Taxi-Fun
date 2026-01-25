import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestOtpDto, VerifyOtpDto, UserRole, AdminLoginDto } from './dto/auth.dto';
import { ClientsService } from '../clients/clients.service';
import { DriversService } from '../drivers/drivers.service';
import { AdminsService } from '../admins/admins.service';
import { CacheService } from '../common/cache/cache.service';
import { TWILIO_CLIENT } from '../common/twilio/twilio.module';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @Inject(TWILIO_CLIENT) private readonly twilioClient: Twilio,
        private readonly configService: ConfigService,
        private readonly cacheService: CacheService,
        private jwtService: JwtService,
        private driversService: DriversService,
        private clientsService: ClientsService,
        private adminsService: AdminsService,
    ) { }

   async requestOtp(dto: RequestOtpDto) {
    const { phoneNumber, role } = dto;

    // 1. Vérifier si l'utilisateur existe
    const user = await this.getUser(phoneNumber, role);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    // 2. Générer l'OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Stocker dans le cache
    const cacheKey = `otp:${role}:${phoneNumber}`;
    await this.cacheService.set(cacheKey, otp, 300);

    // 4. LOGIQUE DE TEST POUR SWAGGER
    // On vérifie si on est en mode local/dev
    const isDev = this.configService.get('NODE_ENV') !== 'production';

    return { 
        message: 'OTP envoyé avec succès',
        // On ajoute l'OTP ici UNIQUEMENT pour les tests
        debugCode: isDev ? otp : 'Envoyé par SMS' 
    };
}

    async verifyOtp(dto: VerifyOtpDto) {
        const { phoneNumber, otpCode, role } = dto;
        const cacheKey = `otp:${role}:${phoneNumber}`;

        // 1. Récupérer l'OTP dans le cache
        const storedOtp = await this.cacheService.get(cacheKey);

        if (!storedOtp || storedOtp !== otpCode) {
            throw new UnauthorizedException('OTP invalide ou expiré');
        }

        // 2. Supprimer l'OTP immédiatement après réussite
        await this.cacheService.del(cacheKey);

        // 3. Récupérer l'utilisateur
        const user = await this.getUser(phoneNumber, role);
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        return {
            accessToken: this.jwtService.sign({ sub: user.id, role }),
            user,
        };
    }

    private async sendSms(phone: string, message: string) {
        try {
            const from = this.configService.get('TWILIO_PHONE_NUMBER');

            const result = await this.twilioClient.messages.create({
                body: message,
                from: from,
                to: phone, // Assure-toi que le phone est au format +237...
            });

            console.log(`[Twilio] SMS envoyé avec succès : ${result.sid}`);
        } catch (error) {
            console.error('[Twilio Error]', error);
            // Optionnel : ne pas bloquer l'utilisateur si le SMS échoue en dev
        }
    }

    // --- Méthodes privées d'aide ---

    private async checkUserExists(phoneNumber: string, role: UserRole) {
        const user = await this.getUser(phoneNumber, role);
        if (!user) throw new NotFoundException(`${role} not found with this phone number`);
    }

    private async getUser(phoneNumber: string, role: UserRole) {
        if (role === UserRole.DRIVER) {
            return this.driversService.findByPhone(phoneNumber);
        } else if (role === UserRole.CLIENT) {
            return this.clientsService.findByPhone(phoneNumber);
        }
        // Admin gere differemment (email/password)
        throw new BadRequestException('Role not supported for OTP');
    }

    /**
     * Connexion administrateur par email/mot de passe
     */
    async adminLogin(dto: AdminLoginDto) {
        const { email, password } = dto;

        // Valider les credentials
        const admin = await this.adminsService.validateCredentials(email, password);

        return {
            accessToken: this.jwtService.sign({ sub: admin.id, role: UserRole.ADMIN }),
            user: admin,
        };
    }
}
