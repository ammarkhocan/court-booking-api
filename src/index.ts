import { cors } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { courtsRoute } from "./modules/court/route";

const app = new OpenAPIHono();

app.use(cors());

app.route("/courts", courtsRoute);

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
