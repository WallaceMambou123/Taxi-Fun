import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendSmsResponse {
    status: number;
    code: string;
    message: string;
}

export interface SmsBalanceResponse {
    status: number;
    solde?: number;
    message?: string;
}

@Injectable()
export class SmsService {
    private readonly apiUrl = 'https://devcodesms.com/developpeur';
    private readonly apiKey: string;
    private readonly sender: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('DEVCODE_SMS_API_KEY') || '';
        this.sender = this.configService.get<string>('DEVCODE_SMS_SENDER') || 'TaxiFun';
    }

    /**
     * Vérifie si le service SMS est configuré
     */
    isConfigured(): boolean {
        return !!this.apiKey;
    }

    /**
     * Consulte le solde SMS du compte
     */
    async getBalance(): Promise<SmsBalanceResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/Solde_sms_dev`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: this.apiKey,
                }),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('[DevCodeSMS] Erreur lors de la vérification du solde:', error.message);
            return {
                status: 500,
                message: 'Erreur de connexion au service SMS',
            };
        }
    }

    /**
     * Envoie un SMS via DevCodeSMS API
     * @param phone Numéro de téléphone au format +237XXXXXXXXX
     * @param message Message à envoyer
     */
    async sendSms(phone: string, message: string): Promise<SendSmsResponse> {
        if (!this.isConfigured()) {
            console.warn('[DevCodeSMS] API non configurée. Ajoutez DEVCODE_SMS_API_KEY dans .env');
            return {
                status: 400,
                code: 'NOT_CONFIGURED',
                message: 'Service SMS non configuré',
            };
        }

        try {
            const response = await fetch(`${this.apiUrl}/Send_sms_dev`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: this.apiKey,
                    sender: this.sender,
                    phone: phone,
                    message: message,
                }),
            });

            const result = await response.json();

            if (result.status === 200 || result.code === 'Success') {
                console.log(`[DevCodeSMS] SMS envoyé avec succès à ${phone}`);
            } else {
                console.error(`[DevCodeSMS] Erreur envoi SMS:`, result);
            }

            return result;
        } catch (error) {
            console.error('[DevCodeSMS] Erreur:', error.message);
            return {
                status: 500,
                code: 'ERROR',
                message: error.message || 'Erreur lors de l\'envoi du SMS',
            };
        }
    }

    /**
     * Envoie un code OTP par SMS
     * @param phone Numéro de téléphone
     * @param otpCode Code OTP à envoyer
     */
    async sendOtp(phone: string, otpCode: string): Promise<SendSmsResponse> {
        const message = `Votre code TaxiFun est: ${otpCode}. Valide pendant 5 minutes.`;
        return this.sendSms(phone, message);
    }
}
