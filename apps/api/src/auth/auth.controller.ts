import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginInputSchema, RegisterInputSchema } from "@rpg-realm/shared";
import type { LoginInput, RegisterInput } from "@rpg-realm/shared";

import { ZodValidationPipe } from "./zod-validation.pipe";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  create(
    @Body(new ZodValidationPipe(RegisterInputSchema)) body: RegisterInput,
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.displayName,
    );
  }

  @Post("login")
  @HttpCode(200)
  login(@Body(new ZodValidationPipe(LoginInputSchema)) body: LoginInput) {
    return this.authService.login(body.email, body.password);
  }
}
