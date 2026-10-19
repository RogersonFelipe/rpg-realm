import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string().datetime(),
});

export const RegisterInputSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2).max(32),
  password: z.string().min(8).max(128),
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const UserPublicSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().min(2).max(32),
  createdAt: z.string().datetime(),
});

export const AuthResponseSchema = z.object({
  user: UserPublicSchema,
  accessToken: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
