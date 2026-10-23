import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginInputSchema, RegisterInputSchema } from "@rpg-realm/shared";
import type { LoginInput, RegisterInput } from "@rpg-realm/shared";
import { ZodValidationPipe } from "./zod-validation.pipe";

const REFRESH_COOKIE_NAME = "refreshToken";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async create(
    @Body(new ZodValidationPipe(RegisterInputSchema)) body: RegisterInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { authResponse, refreshToken } = await this.authService.register(
      body.email,
      body.password,
      body.displayName,
    );
    this.setRefreshCookie(res, refreshToken);
    return authResponse;
  }

  @Post("login")
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(LoginInputSchema)) body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { authResponse, refreshToken } = await this.authService.login(
      body.email,
      body.password,
    );
    this.setRefreshCookie(res, refreshToken);
    return authResponse;
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;

    if (!rawToken) {
      this.clearRefreshCookie(res);
      throw new UnauthorizedException("Refresh token inválido.");
    }

    try {
      const { authResponse, refreshToken } =
        await this.authService.refresh(rawToken);
      this.setRefreshCookie(res, refreshToken);
      return { accessToken: authResponse.accessToken };
    } catch (error) {
      this.clearRefreshCookie(res);
      throw error;
    }
  }

  @Post("logout")
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;
    await this.authService.logout(rawToken);
    this.clearRefreshCookie(res);
  }

  private setRefreshCookie(res: Response, token: string) {
    const ttlDays = Number(process.env.REFRESH_TTL_DAYS ?? 7);
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/auth",
      maxAge: ttlDays * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/auth" });
  }
}
