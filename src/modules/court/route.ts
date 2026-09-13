import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "../../lib/db";
import {
  CourtIdParamSchema,
  CourtSchema,
  CourtSlugParamSchema,
  CourtsSchema,
  ErrorSchema,
} from "./schema";

export const courtsRoute = new OpenAPIHono();

courtsRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Courts"],
    summary: "Get all courts",
    responses: {
      200: {
        description: "List of courts",
        content: {
          "application/json": {
            schema: CourtsSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const courts = await db.court.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return c.json(
      courts.map((court) => ({
        ...court,
        createdAt: court.createdAt.toISOString(),
        updatedAt: court.updatedAt.toISOString(),
      })),
      200,
    );
  },
);

courtsRoute.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Courts"],
    summary: "Get court by ID",
    request: {
      params: CourtIdParamSchema,
    },
    responses: {
      200: {
        description: "Court detail",
        content: {
          "application/json": {
            schema: CourtSchema,
          },
        },
      },
      404: {
        description: "Court not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const court = await db.court.findUnique({
      where: {
        id,
      },
    });

    if (!court) {
      return c.json(
        {
          message: "Court not found",
        },
        404,
      );
    }

    return c.json(
      {
        ...court,
        createdAt: court.createdAt.toISOString(),
        updatedAt: court.updatedAt.toISOString(),
      },
      200,
    );
  },
);

courtsRoute.openapi(
  createRoute({
    method: "get",
    path: "slug/{slug}",
    tags: ["Courts"],
    summary: "Get court by slug",
    request: {
      params: CourtSlugParamSchema,
    },
    responses: {
      200: {
        description: "Court detail",
        content: {
          "application/json": {
            schema: CourtSchema,
          },
        },
      },
      404: {
        description: "Court not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const { slug } = c.req.valid("param");

    const court = await db.court.findUnique({
      where: {
        slug,
      },
    });

    if (!court) {
      return c.json(
        {
          message: "Court not found",
        },
        404,
      );
    }

    return c.json(
      {
        ...court,
        createdAt: court.createdAt.toISOString(),
        updatedAt: court.updatedAt.toISOString(),
      },
      200,
    );
  },
);
