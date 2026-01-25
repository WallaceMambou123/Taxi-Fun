import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'SUPER_SECRET_KEY', // Met ça dans ton .env
        });
    }

    // Cette fonction s'exécute automatiquement quand une route est protégée
    async validate(payload: any) {
        // payload = { sub: 'uuid', role: 'DRIVER' }
        console.log('JWT Payload:', payload); // Log the payload for debugging

        let user;
        if (payload.role === 'DRIVER') {
            user = await this.prisma.driver.findUnique({ where: { id: payload.sub } });
        } else if (payload.role === 'CLIENT') {
            user = await this.prisma.client.findUnique({ where: { id: payload.sub } });
        } else if (payload.role === 'ADMIN') {
            user = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
        }

        if (!user) {
            console.error('User not found for payload:', payload); // Log error if user is not found
            throw new UnauthorizedException();
        }

        console.log('Validated User:', user); // Log the validated user

        // Ajoute le rôle à l'objet user pour l'utiliser dans les Guards
        return { ...user, role: payload.role };
    }
}