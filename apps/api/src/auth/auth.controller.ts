import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterInputSchema } from "@rpg-realm/shared";
import type { RegisterInput } from "@rpg-realm/shared";

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
}
