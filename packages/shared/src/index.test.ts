import { describe, it, expect } from "vitest";
import {
  HealthResponseSchema,
  RegisterInputSchema,
  LoginInputSchema,
} from "./index";

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

describe("RegisterInputSchema", () => {
  it("Registro efetuado com Sucesso:", () => {
    const result = RegisterInputSchema.safeParse({
      email: "email@dominio.com",
      displayName: "Nome User",
      password: "Senha User",
    });
    expect(result.success).toBe(true);
  });

  it("Rejeita e-mail inválido", () => {
    const result = RegisterInputSchema.safeParse({
      email: "nao-é-um-email",
      displayName: "Nome User",
      password: "Senha User",
    });
    expect(result.success).toBe(false);
  });

  it("Rejeita Nome inválido", () => {
    const result = RegisterInputSchema.safeParse({
      email: "email@dominio.com",
      displayName: "1",
      password: "Senha User",
    });
    expect(result.success).toBe(false);
  });

  it("Rejeita Senha inválida", () => {
    const result = RegisterInputSchema.safeParse({
      email: "email@dominio.com",
      displayName: "Nome User",
      password: "Errada",
    });
    expect(result.success).toBe(false);
  });

  it("Erro ao registrar:", () => {
    const result = RegisterInputSchema.safeParse({
      email: null,
      displayName: null,
      password: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("LoginInputSchema", () => {
  it("Login efetuado com Sucesso:", () => {
    const result = LoginInputSchema.safeParse({
      email: "email@dominio.com",
      password: "Senha User",
    });
    expect(result.success).toBe(true);
  });

  it("Erro ao Logar:", () => {
    const result = LoginInputSchema.safeParse({
      email: null,
      password: null,
    });
    expect(result.success).toBe(false);
  });
});
