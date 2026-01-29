import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) { }

    async sendSms(phoneNumber: string, message: string): Promise<{ success: boolean; data?: any }> {
        try {
            const apiUrl = "https://devcodesms.com/developpeur/Send_sms_dev";
            const apiKey = this.configService.get('DEVCODE_API_KEY');
            const senderId = this.configService.get('DEVCODE_SENDER_ID');

            // 1. Nettoyage du numéro : on enlève le '+' s'il existe
            const cleanPhone = phoneNumber.startsWith('+')
                ? phoneNumber.substring(1)
                : phoneNumber;

            const payload = {
                api_key: apiKey,
                phone: cleanPhone, // On utilise le numéro propre
                message: message,
                sender: senderId,
            };

            const response = await firstValueFrom(
                this.httpService.post(apiUrl, payload, {
                    headers: { 'Content-Type': 'application/json' }
                })
            );

            // 2. On retourne toujours un objet, jamais null
            // Note: Vérifie si DevCode renvoie 'success' ou 'status'
            return {
                success: response.data?.status === 'success' || response.data?.code === 200,
                data: response.data
            };

        } catch (error) {
            console.error('Erreur SMS DevCode:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            // 3. Retourne un objet success: false au lieu de null !
            return { success: false };
        }
    }
}