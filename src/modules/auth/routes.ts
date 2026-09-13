import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { db } from "../../lib/db";

import { RegisterUserScema, UserSchema } from "../user/schema";

export const authRoute = new OpenAPIHono();

authRoute.openapi(
  createRoute({
    method: "post",
    path: "/register",
    request: {
      body: { content: { "application/json": { schema: RegisterUserScema } } },
    },
    responses: {
      201: {
        description: "Register new users",
        content: { "application/json": { schema: UserSchema } },
      },
      400: {
        description: "Failed to register new user",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");

    const user = await db.user.create({
      data: {
        username: body.username,
        email: body.email,
        fullName: body.fullName,
      },
    });

    return c.json(user);
  },
);
