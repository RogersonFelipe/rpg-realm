import { Injectable } from "@nestjs/common";
import type { HealthResponse } from "@rpg-realm/shared";

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
