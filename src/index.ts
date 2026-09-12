import { db } from "./lib/db";
import { cors } from "hono/cors";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { CourtsSchema } from "./modules/court/schema";

const app = new OpenAPIHono();

app.use(cors());

// app.get("/", (c) => {
//   return c.json({
//     title: "Court Booking API",
//   });
// });

app.openapi(
  createRoute({
    method: "get",
    path: "/courts",
    responses: {
      200: {
        content: { "application/json": { schema: CourtsSchema } },
      },
    },
  }),
  async (c) => {
    const courts = await db.court.findMany();

    return c.json(courts);
  },
);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Court Booking API",
    version: "1.0.0",
  },
});

app.get(
  "/",
  Scalar({
    pageTitle: "Court Booking API",
    url: "openapi.json",
  }),
);

export default app;
