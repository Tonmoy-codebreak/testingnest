import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // async create(dto: CreateUserDto) {
  //   const existing = await this.prisma.user.findUnique({
  //     where: { email: dto.email },
  //   });
  //   if (existing) {
  //     throw new ConflictException('Email already in use');
  //   }

  //   const hashedPassword = await bcrypt.hash(dto.password, 10);

  //   const user = await this.prisma.user.create({
  //     data: {
  //       email: dto.email,
  //       password: hashedPassword,
  //       name: dto.name,
  //       role: dto.role,
  //     },
  //   });

  //   return this.excludePassword(user);
  // }

  // -----------------------------------------------

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role,
      },
    });

    return this.excludePassword(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.excludePassword(u));
  }

  // -----------------------------------------------
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.excludePassword(user);
  }
  // -----------------------------------------------
  async findByEmail(email: string) {
    // used internally by auth module — includes password, do NOT expose via controller
    return this.prisma.user.findUnique({ where: { email } });
  }
  // -----------------------------------------------
  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id); // throws if not found
    const user = await this.prisma.user.update({ where: { id }, data: dto });
    return this.excludePassword(user);
  }
  // -----------------------------------------------
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted' };
  }
  // ---------------------------------------------------------------------------
  private excludePassword(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
