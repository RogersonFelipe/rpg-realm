import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "./password.service";
import { RefreshTokenService } from "./refresh-token.service";
import { Prisma } from "../generated/prisma/client";
import { JwtService } from "@nestjs/jwt";
import type { AuthResponse } from "@rpg-realm/shared";

export interface AuthResult {
  authResponse: AuthResponse;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private refreshTokenService: RefreshTokenService,
    private jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthResult> {
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

      return this.buildAuthResult(user);
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

  async login(email: string, password: string): Promise<AuthResult> {
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

    return this.buildAuthResult(user);
  }

  async refresh(rawToken: string): Promise<AuthResult> {
    const tokenHash = this.refreshTokenService.hashToken(rawToken);

    const found = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!found) {
      throw new UnauthorizedException("Refresh token inválido.");
    }

    if (found.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: found.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException("Refresh token inválido.");
    }

    if (found.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token inválido.");
    }

    await this.prisma.refreshToken.update({
      where: { id: found.id },
      data: { revokedAt: new Date() },
    });

    return this.buildAuthResult(found.user);
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) {
      return;
    }

    const tokenHash = this.refreshTokenService.hashToken(rawToken);

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async buildAuthResult(user: {
    id: number;
    uuid: string;
    email: string;
    displayName: string;
    createdAt: Date;
  }): Promise<AuthResult> {
    const accessToken = this.jwtService.sign({ sub: user.uuid });
    const refreshToken = await this.issueRefreshToken(user.id);

    return {
      authResponse: {
        user: {
          id: user.uuid,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt.toISOString(),
        },
        accessToken,
      },
      refreshToken,
    };
  }

  private async issueRefreshToken(userId: number): Promise<string> {
    const token = this.refreshTokenService.generateToken();
    const tokenHash = this.refreshTokenService.hashToken(token);
    const ttlDays = Number(process.env.REFRESH_TTL_DAYS ?? 7);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return token;
  }
}
