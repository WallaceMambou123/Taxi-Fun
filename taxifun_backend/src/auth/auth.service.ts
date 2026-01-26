import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestOtpDto, VerifyOtpDto, UserRole, AdminLoginDto } from './dto/auth.dto';
import { ClientsService } from '../clients/clients.service';
import { DriversService } from '../drivers/drivers.service';
import { AdminsService } from '../admins/admins.service';
import { RedisService } from '../common/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { SmsService } from '../common/sms/sms.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
        private readonly smsService: SmsService,
        private jwtService: JwtService,
        private driversService: DriversService,
        private clientsService: ClientsService,
        private adminsService: AdminsService,
    ) {}

    async requestOtp(dto: RequestOtpDto) {
        const { phoneNumber, role } = dto;

        // 1. Vérifier si l'utilisateur existe
        const user = await this.getUser(phoneNumber, role);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        // 2. Générer l'OTP (code à 4 chiffres)
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // 3. Stocker dans Redis (expire après 5 minutes)
        const cacheKey = `otp:${role}:${phoneNumber}`;
        await this.redisService.set(cacheKey, otp, 300);

        // 4. Envoyer le SMS via DevCodeSMS
        let smsSent = false;
        if (this.smsService.isConfigured()) {
            try {
                const result = await this.smsService.sendOtp(phoneNumber, otp);
                smsSent = result.status === 200 || result.code === 'Success';
                if (smsSent) {
                    console.log(`[OTP] SMS envoyé à ${phoneNumber}`);
                }
            } catch (error) {
                console.error('[OTP] Erreur envoi SMS:', error.message);
            }
        } else {
            console.log(`[OTP] DevCodeSMS non configuré. Code pour ${phoneNumber}: ${otp}`);
        }

        // 5. Réponse (en dev, on affiche le code pour les tests)
        const isDev = this.configService.get('NODE_ENV') !== 'production';

        return {
            message: smsSent ? 'Code OTP envoyé par SMS' : 'Code OTP généré',
            expiresIn: '5 minutes',
            // En dev ou si SMS échoue, on affiche le code pour faciliter les tests
            debugCode: isDev ? otp : undefined,
        };
    }

    async verifyOtp(dto: VerifyOtpDto) {
        const { phoneNumber, otpCode, role } = dto;
        const cacheKey = `otp:${role}:${phoneNumber}`;

        const storedOtp = await this.redisService.get(cacheKey);
        if (!storedOtp || storedOtp !== otpCode) {
            throw new UnauthorizedException('OTP invalide ou expiré');
        }

        await this.redisService.del(cacheKey);

        const user = await this.getUser(phoneNumber, role);
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        return {
            accessToken: this.jwtService.sign({ sub: user.id, role }),
            user,
        };
    }

    private async getUser(phoneNumber: string, role: UserRole) {
        if (role === UserRole.DRIVER) {
            return this.driversService.findByPhone(phoneNumber);
        } else if (role === UserRole.CLIENT) {
            return this.clientsService.findByPhone(phoneNumber);
        }
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
