import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { db } from "../../lib/db";
import { signToken } from "../../lib/token";

import { checkAuthorized } from "./middleware";
import {
  LoginResponseSchema,
  LoginUserScema,
  RegisterUserScema,
} from "./schema";
import { PrivateUserSchema } from "../user/schema";

export const authRoute = new OpenAPIHono();

authRoute.openapi(
  createRoute({
    method: "post",
    path: "/register",
    tags: ["Auth"],
    summary: "Register user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: RegisterUserScema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Register new user",
        content: {
          "application/json": {
            schema: PrivateUserSchema,
          },
        },
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
            create: {
              hash,
            },
          },
        },
      });

      return c.json(user, 201);
    } catch {
      return c.json(
        {
          message: "Username or email already exists",
        },
        400,
      );
    }
  },
);

authRoute.openapi(
  createRoute({
    method: "post",
    path: "/login",
    tags: ["Auth"],
    summary: "Login user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: LoginUserScema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Logged in user",
        content: { "text/plain": { schema: LoginResponseSchema } },
      },
      400: {
        description: "Failed to login user",
      },
      401: {
        description: "Invalid email or password",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");

    try {
      const user = await db.user.findUnique({
        where: {
          email: body.email,
        },
        include: {
          password: true,
        },
      });

      if (!user || !user.password?.hash) {
        return c.json(
          {
            message: "Invalid email or password",
          },
          401,
        );
      }

      const isMatch = await Bun.password.verify(
        body.password,
        user.password.hash,
      );

      if (!isMatch) {
        return c.json(
          {
            message: "Invalid email or password",
          },
          401,
        );
      }

      const token = await signToken(user.id);

      return c.text(token);
    } catch {
      return c.json(
        {
          message: "Failed to login user",
        },
        400,
      );
    }
  },
);

authRoute.openapi(
  createRoute({
    method: "get",
    path: "/me",
    tags: ["Auth"],
    summary: "Get authenticated user",
    middleware: checkAuthorized,
    responses: {
      200: {
        description: "Get authenticated user",
        content: {
          "application/json": {
            schema: PrivateUserSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
    },
  }),
  async (c) => {
    const user = c.get("user");

    return c.json(user, 200);
  },
);
