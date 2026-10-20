import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "./password.service";
import { Prisma } from "../generated/prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}
  async register(email: string, password: string, displayName: string) {
    const passwordHash = await this.passwordService.hash(password);
    const emailFormatado = email.trim().toLowerCase();

    try {
      return await this.prisma.user.create({
        data: {
          email: emailFormatado,
          passwordHash,
          displayName,
        },
      });
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
}
