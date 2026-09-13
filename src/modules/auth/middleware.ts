import { createMiddleware } from "hono/factory";
import { db } from "../../lib/db";
import { verifyToken } from "../../lib/token";
import type { PrivateUser } from "../user/schema";

export type AuthEnv = {
  Variables: {
    user: PrivateUser;
  };
};

export const checkAuthorized = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      return c.json(
        {
          message: "Authorization header is required",
        },
        401,
      );
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return c.json(
        {
          message: "Invalid authorization format",
        },
        401,
      );
    }

    const payload = await verifyToken(token);

    if (!payload.sub) {
      return c.json(
        {
          message: "Invalid token payload",
        },
        401,
      );
    }

    const user = await db.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      return c.json(
        {
          message: "User is no longer available",
        },
        401,
      );
    }

    c.set("user", user);

    await next();
  } catch {
    return c.json(
      {
        message: "Invalid or expired token",
      },
      401,
    );
  }
});
