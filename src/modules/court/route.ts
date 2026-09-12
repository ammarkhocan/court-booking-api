import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "../../lib/db";
import { CourtSchema, CourtSlugParamSchema, CourtsSchema } from "./schema";

export const courtsRoute = new OpenAPIHono();

courtsRoute.openapi(
  createRoute({
    method: "get",
    path: "/courts",
    responses: {
      200: {
        description: "Get all courts",
        content: { "application/json": { schema: CourtsSchema } },
      },
    },
  }),
  async (c) => {
    const courts = await db.court.findMany();

    return c.json(courts);
  },
);

courtsRoute.openapi(
  createRoute({
    method: "get",
    path: "/courts/{slug}",
    request: { params: CourtSlugParamSchema },
    responses: {
      200: {
        description: "Get one court by slug",
        content: { "application/json": { schema: CourtSchema } },
      },
      404: {
        description: "Court by slug not found",
      },
    },
  }),
  async (c) => {
    const { slug } = c.req.valid("param");

    const court = await db.court.findUnique({ where: { slug } });

    if (!court) {
      return c.notFound();
    }

    return c.json(court);
  },
);
