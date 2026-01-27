import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // <--- INDISPENSABLE
import { ConfigModule } from '@nestjs/config'; // <--- INDISPENSABLE pour ConfigService
import { SmsService } from './sms.service';

@Module({
    imports: [
        HttpModule,   // Fournit HttpService
        ConfigModule, // Fournit ConfigService
    ],
    providers: [SmsService],
    exports: [SmsService],
})
export class SmsModule { }