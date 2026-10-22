import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "./password.service";
import { Prisma } from "../generated/prisma/client";
import { JwtService } from "@nestjs/jwt";
import type { AuthResponse } from "@rpg-realm/shared";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}
  async register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthResponse> {
    const passwordHash = await this.passwordService.hash(password);
    const emailFormatado = email.trim().toLowerCase();

    try {
      const user = await this.prisma.user.create({
        data: {
          email: emailFormatado,
          passwordHash,
          displayName,
        },
      });

      const accessToken = this.jwtService.sign({ sub: user.uuid });

      return {
        user: {
          id: user.uuid,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt.toISOString(),
        },
        accessToken,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Este e-mail já está em uso.");
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const emailFormatado = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: emailFormatado },
    });

    if (!user) {
      throw new UnauthorizedException("E-mail ou senha inválida.");
    }

    const senhaValida = await this.passwordService.verify(
      user.passwordHash,
      password,
    );

    if (!senhaValida) {
      throw new UnauthorizedException("E-mail ou senha inválida.");
    }

    const accessToken = this.jwtService.sign({ sub: user.uuid });

    return {
      user: {
        id: user.uuid,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
    };
  }
}
