import { z } from "@hono/zod-openapi";
import { PrivateUserSchema } from "../user/schema";

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

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: PrivateUserSchema,
});

// export const TokenSchema = z.string();
