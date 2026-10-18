import { describe, it, expect } from "vitest";
import { HealthResponseSchema } from "./index";

describe("HealthResponseSchema", () => {
  it("Online", () => {
    const result = HealthResponseSchema.safeParse({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("Offline", () => {
    const result = HealthResponseSchema.safeParse({
      status: "offline",
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });
});
