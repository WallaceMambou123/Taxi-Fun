import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
    // On injecte les deux services dans le constructeur
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService // <--- C'ETAIT L'OUBLI CRITIQUE !
    ) { }

    async sendSms(phoneNumber: string, message: string): Promise<any> {
        try {
            const apiUrl = "https://devcodesms.com/developpeur/Send_sms_dev";

            // 1. Log tes clés pour être SUR qu'elles sont bien chargées
            const apiKey = this.configService.get('DEVCODE_API_KEY');
            const senderId = this.configService.get('DEVCODE_SENDER_ID');

            console.log('Envoi SMS vers:', phoneNumber, 'avec SenderID:', senderId);

            const payload = {
                api_key: apiKey,
                phone: phoneNumber,
                message: message,
                sender: senderId,
            };

            // 2. Utilise des headers propres pour éviter l'undefined
            const response = await firstValueFrom(
                this.httpService.post(apiUrl, payload, {
                    headers: { 'Content-Type': 'application/json' }
                })
            );

            return response.data;
        } catch (error) {
            // Log plus précis pour voir si c'est l'URL ou les paramètres
            console.error('Erreur SMS DevCode:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            return null;
        }
    }
}