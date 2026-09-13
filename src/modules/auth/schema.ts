import { z } from "@hono/zod-openapi";

export const RegisterUserScema = z.object({
  username: z.string(),
  email: z.string(),
  fullName: z.string(),
  password: z.string(),
});

export const LoginUserScema = z.object({
  email: z.string(),
  password: z.string(),
});

export const TokenSchema = z.string();
