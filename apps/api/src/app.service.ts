import { Injectable } from "@nestjs/common";
import { HealthResponse } from "@rpg-realm/shared";

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
