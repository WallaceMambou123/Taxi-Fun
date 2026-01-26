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
import { FirebaseAuthService } from './firebase-auth.service';
import { PrismaService } from '../prisma/prisma.service';


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
        private readonly firebaseAuthService: FirebaseAuthService,
        private readonly prisma: PrismaService,
    ) { }

    async requestOtp(dto: RequestOtpDto) {
        const { phoneNumber, role } = dto;

        // 1. Vérifier si l'utilisateur existe
        const user = await this.getUser(phoneNumber, role);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        // 2. Générer l'OTP (code à 4 chiffres)
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // 3. Stocker dans le cache (expire après 5 minutes)
        const cacheKey = `otp:${role}:${phoneNumber}`;
        await this.cacheService.set(cacheKey, otp, 300);

        // 4. Envoyer le SMS via Twilio
        const twilioConfigured = this.configService.get('TWILIO_ACCOUNT_SID') &&
                                  this.configService.get('TWILIO_AUTH_TOKEN') &&
                                  this.configService.get('TWILIO_PHONE_NUMBER');

        let smsSent = false;
        if (twilioConfigured) {
            try {
                await this.sendSms(phoneNumber, `Votre code TaxiFun est: ${otp}. Valide pendant 5 minutes.`);
                smsSent = true;
                console.log(`[OTP] SMS envoyé à ${phoneNumber}`);
            } catch (error) {
                console.error('[OTP] Erreur envoi SMS:', error.message);
            }
        } else {
            console.log(`[OTP] Twilio non configuré. Code pour ${phoneNumber}: ${otp}`);
        }

        // 5. Réponse (en dev, on affiche le code pour les tests)
        const isDev = this.configService.get('NODE_ENV') !== 'production';

        return {
            message: smsSent ? 'Code OTP envoyé par SMS' : 'Code OTP généré',
            expiresIn: '5 minutes',
            // En dev ou si SMS échoue, on affiche le code pour faciliter les tests
            debugCode: isDev ? otp : undefined
        };
    }

    async verifyOtp(dto: VerifyOtpDto) {
        // Two possible flows supported:
        // 1) Traditional cache-based OTP: dto contains phoneNumber, otpCode and role
        // 2) Firebase-based phone auth: dto contains firebaseToken and role (phoneNumber ignored)

        // If firebaseToken provided, verify it with Firebase and find/create user
        if (dto.firebaseToken) {
            const decoded = await this.firebaseAuthService.verifyToken(dto.firebaseToken);
            const phoneNumber = decoded.phone_number;
            if (!phoneNumber) throw new UnauthorizedException('Firebase token does not contain phone number');

            // Find by role in corresponding table
            if (dto.role === UserRole.DRIVER) {
                let driver = await this.prisma.driver.findUnique({ where: { phoneNumber } });
                if (!driver) {
                    driver = await this.prisma.driver.create({ data: { phoneNumber } });
                }
                return {
                    accessToken: this.jwtService.sign({ sub: driver.id, role: UserRole.DRIVER }),
                    user: driver,
                };
            } else if (dto.role === UserRole.CLIENT) {
                let client = await this.prisma.client.findUnique({ where: { phoneNumber } });
                if (!client) {
                    client = await this.prisma.client.create({ data: { phoneNumber } });
                }
                return {
                    accessToken: this.jwtService.sign({ sub: client.id, role: UserRole.CLIENT }),
                    user: client,
                };
            } else {
                throw new BadRequestException('Role not supported for Firebase phone auth');
            }
        }

        // Fallback to cache-based OTP flow
        const { phoneNumber, otpCode, role } = dto as VerifyOtpDto;
        const cacheKey = `otp:${role}:${phoneNumber}`;

        const storedOtp = await this.cacheService.get(cacheKey);
        if (!storedOtp || storedOtp !== otpCode) {
            throw new UnauthorizedException('OTP invalide ou expiré');
        }

        await this.cacheService.del(cacheKey);

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
