// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        super(); // En v6, il lira l'URL dans le schéma via le .env automatiquement
    }

    async onModuleInit() {
        await this.$connect();
    }
}