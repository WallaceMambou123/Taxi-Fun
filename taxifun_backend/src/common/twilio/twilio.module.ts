import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

export const TWILIO_CLIENT = 'TWILIO_CLIENT';

@Global() // On le rend global pour ne pas l'importer partout
@Module({
    providers: [
        {
            provide: TWILIO_CLIENT,
            useFactory: (configService: ConfigService) => {
                const accountSid = configService.get('TWILIO_ACCOUNT_SID');
                const authToken = configService.get('TWILIO_AUTH_TOKEN');
                return new Twilio(accountSid, authToken);
            },
            inject: [ConfigService],
        },
    ],
    exports: [TWILIO_CLIENT],
})
export class TwilioModule { }