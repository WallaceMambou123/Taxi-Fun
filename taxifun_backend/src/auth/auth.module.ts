import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ClientsModule } from 'src/clients/clients.module';
import { DriversModule } from 'src/drivers/drivers.module';
import { AdminsModule } from 'src/admins/admins.module';
//import { TwilioModule } from '../common/twilio/twilio.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { SmsModule } from 'src/common/sms/sms.module';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        // On configure Redis pour qu'il sache où se connecter dans le réseau Docker
        RedisModule.forRoot({
            type: 'single',
            url: process.env.REDIS_URL || 'redis://taxifun-cache:6379',
        }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY',
            signOptions: { expiresIn: '7d' },
        }),
        ClientsModule,
        DriversModule,
        AdminsModule,
        SmsModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }