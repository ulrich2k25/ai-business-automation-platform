import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}