import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ClientsModule } from '../clients/clients.module';
import { DriversModule } from '../drivers/drivers.module';
import { TwilioModule } from '../common/twilio/twilio.module';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY',
            signOptions: { expiresIn: '7d' }, // Token valide 7 jours pour mobile
        }),
        ClientsModule,
        DriversModule,
        TwilioModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }