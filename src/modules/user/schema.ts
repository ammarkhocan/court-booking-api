import { z } from "@hono/zod-openapi";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PrivateUserSchema = UserSchema.extend({
  email: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export type PrivateUser = z.infer<typeof PrivateUserSchema>;

export const UsersSchema = z.array(UserSchema);

export const UserIdParamSchem = z.object({
  id: z.string(),
});
