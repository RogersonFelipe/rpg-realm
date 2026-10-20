import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "crypto";

@Injectable()
export class RefreshTokenService {
  generateToken(): string {
    return randomBytes(32).toString("hex");
  }

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
