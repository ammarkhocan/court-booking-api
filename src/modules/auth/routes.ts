import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { db } from "../../lib/db";

import {
  LoginUserScema,
  RegisterUserScema,
  TokenSchema,
  UserSchema,
} from "../user/schema";

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

    try {
      const hash = await Bun.password.hash(body.password);

      const user = await db.user.create({
        data: {
          username: body.username,
          email: body.email,
          fullName: body.fullName,
          password: {
            create: { hash },
          },
        },
      });

      return c.json(user, 201);
    } catch (error) {
      return c.json({ message: "User or email already exist" }, 400);
    }
  },
);

authRoute.openapi(
  createRoute({
    method: "post",
    path: "/login",
    request: {
      body: { content: { "application/json": { schema: LoginUserScema } } },
    },
    responses: {
      200: {
        description: "Logged in user",
        content: { "text/plain": { schema: TokenSchema } },
      },
      400: {
        description: "Failed to login user",
      },
      404: {
        description: "User not found",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");

    try {
      const user = await db.user.findUnique({
        where: { email: body.email },
        include: {
          password: true,
        },
      });

      if (!user) {
        return c.notFound();
      }

      if (!user.password?.hash) {
        return c.json({
          message: "User has no password",
        });
      }

      const isMatch = await Bun.password.verify(
        body.password,
        user.password?.hash,
      );

      if (!isMatch) {
        return c.json({
          message: "Password incorect",
        });
      }

      const token = await signToken(user.id);

      return c.text(token);
    } catch (error) {
      return c.json(
        {
          message: "Email or password in correct",
        },
        400,
      );
    }
  },
);
