<<<<<<< HEAD
import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creer un nouvel administrateur avec mot de passe hashe
   */
  async create(createAdminDto: CreateAdminDto) {
    const { password, ...rest } = createAdminDto;

    // Verifier si l'email existe deja
    const existing = await this.prisma.admin.findUnique({
      where: { email: rest.email },
    });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        ...rest,
        passwordHash,
      },
    });

    // Ne pas retourner le hash du mot de passe
    const { passwordHash: _, ...result } = admin;
    return result;
  }

  /**
   * Lister tous les administrateurs (sans les mots de passe)
   */
  async findAll() {
    const admins = await this.prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
    return admins;
  }

  /**
   * Trouver un administrateur par son ID
   */
  async findOne(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
    if (!admin) {
      throw new NotFoundException('Administrateur non trouvé');
    }
    return admin;
  }

  /**
   * Trouver un administrateur par email (pour login)
   */
  async findByEmail(email: string) {
    return this.prisma.admin.findUnique({
      where: { email },
    });
  }

  /**
   * Valider les credentials d'un admin (pour login)
   */
  async validateCredentials(email: string, password: string) {
    const admin = await this.findByEmail(email);
    if (!admin) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const { passwordHash: _, ...result } = admin;
    return result;
  }

  /**
   * Mettre a jour un administrateur
   */
  async update(id: string, updateAdminDto: UpdateAdminDto) {
    // Verifier que l'admin existe
    await this.findOne(id);

    const updateData: any = { ...updateAdminDto };

    // Si le mot de passe est fourni, le hasher
    if (updateAdminDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateAdminDto.password, 10);
      delete updateData.password;
    }

    const admin = await this.prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return admin;
  }

  /**
   * Supprimer un administrateur
   */
  async remove(id: string) {
    // Verifier que l'admin existe
    await this.findOne(id);

    await this.prisma.admin.delete({
      where: { id },
    });

    return { message: 'Administrateur supprimé avec succès' };
=======
import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findAll() {
    return `This action returns all admins`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
>>>>>>> cc8fef2615d4ba134558d599d94cde0f8d040787
  }
}
