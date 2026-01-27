import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestOtpDto, VerifyOtpDto, UserRole } from './dto/auth.dto';
import { ClientsService } from '../clients/clients.service';
import { DriversService } from '../drivers/drivers.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
//import { TWILIO_CLIENT } from 'src/common/twilio/twilio.module';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';
import { SmsService } from 'src/common/sms/sms.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,           // Index 0
        @InjectRedis() private readonly redis: Redis,             // Index 1
        private readonly jwtService: JwtService,                  // Index 2
        private readonly driversService: DriversService,          // Index 3
        private readonly clientsService: ClientsService,          // Index 4
        private readonly smsService: SmsService,
    ) { }

    async requestOtp(dto: RequestOtpDto) {
        const { phoneNumber, role } = dto;
        let otp = '1234';

        // 1. Vérifier si l'utilisateur existe
        const user = await this.getUser(phoneNumber, role);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        // la porte derobe pour les tests
        if (!this.isDevPhoneNumber(phoneNumber)) {
            // 2. Générer un OTP sécurisé
            otp = Math.floor(1000 + Math.random() * 9000).toString();
        }

        // 3. Stocker dans Redis avec une expiration (ex: 300 secondes = 5 minutes)
        const redisKey = `otp:${role}:${phoneNumber}`;
        await this.redis.set(redisKey, otp, 'EX', 300);

        // 4. Envoyer le SMS
        const reponse = await this.smsService.sendSms(phoneNumber, `<#> Votre code TaxiFun est : ${otp}. Ne le partagez pas.`);
        if (!reponse.success) throw new NotFoundException('Une Erreur est survenue');
        console.log(reponse);

        return { message: 'OTP envoyé avec succès' };
    }


    async verifyOtp(dto: VerifyOtpDto) {
        const { phoneNumber, otpCode, role } = dto;
        const redisKey = `otp:${role}:${phoneNumber}`;

        // 1. Récupérer l'OTP dans Redis
        const storedOtp = await this.redis.get(redisKey);

        if (!storedOtp || storedOtp !== otpCode) {
            throw new UnauthorizedException('OTP invalide ou expiré');
        }

        // 2. Supprimer l'OTP immédiatement après réussite
        await this.redis.del(redisKey);

        // 3. Récupérer l'utilisateur
        const user = await this.getUser(phoneNumber, role);
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        return {
            accessToken: this.jwtService.sign({ sub: user.id, role }),
            user,
        };
    }

    /*private async sendTwilioSms(phone: string, message: string) {
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
    }*/

    // --- Méthodes privées d'aide ---

    private async checkUserExists(phoneNumber: string, role: UserRole) {
        const user = await this.getUser(phoneNumber, role);
        if (!user) throw new NotFoundException(`${role} not found with this phone number`);
    }

    private async getUser(phoneNumber: string, role: UserRole) {
        if (role === UserRole.DRIVER) {
            return this.driversService.findByPhone(phoneNumber);
        } else if (role === UserRole.CLIENT) {
            return this.clientsService.findByPhone(phoneNumber); // Appel au nouveau service
        }
        // Admin géré différemment (email/password) normalement
        throw new BadRequestException('Role not supported for OTP');
    }

    // verifier si le numéro de téléphone est celui de l'admin pour les tests
    private isDevPhoneNumber(phoneNumber: string): boolean {
        const devPhoneNumbers = this.configService.get('DEV_PHONE_NUMBERS').split(',');
        return devPhoneNumbers.includes(phoneNumber);
    }
}



