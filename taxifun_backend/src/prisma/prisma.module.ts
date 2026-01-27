import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Rend le module disponible partout sans avoir à l'importer manuellement
@Module({
    providers: [PrismaService],
    exports: [PrismaService], // <--- C'EST CA QUI MANQUE !
})
export class PrismaModule { }