import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "../../lib/db";
import { checkAuthorized } from "../auth/middleware";
import type { AuthEnv } from "../auth/middleware";
import { BookingSchema, CreateBookingSchema, ErrorSchema } from "./schema";

export const bookingsRoute = new OpenAPIHono<AuthEnv>();

const createBookingRoute = createRoute({
  method: "post",
  path: "/",
  middleware: [checkAuthorized] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateBookingSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Booking created successfully",
      content: {
        "application/json": {
          schema: BookingSchema,
        },
      },
    },
    400: {
      description: "Invalid booking request",
      content: {
        "application/json": {
          schema: ErrorSchema,
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
    409: {
      description: "Booking time is not available",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

bookingsRoute.openapi(createBookingRoute, async (c) => {
  const body = c.req.valid("json");
  const user = c.get("user");

  const startTime = new Date(body.startTime);
  const endTime = new Date(body.endTime);

  if (startTime >= endTime) {
    return c.json(
      {
        message: "End time must be after start time",
      },
      400,
    );
  }

  const court = await db.court.findUnique({
    where: {
      id: body.courtId,
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

  const existingBooking = await db.booking.findFirst({
    where: {
      courtId: body.courtId,
      status: "CONFIRMED",
      startTime: {
        lt: endTime,
      },
      endTime: {
        gt: startTime,
      },
    },
  });

  if (existingBooking) {
    return c.json(
      {
        message: "Court is already booked for this time",
      },
      409,
    );
  }

  const durationInMilliseconds = endTime.getTime() - startTime.getTime();

  const durationInHours = durationInMilliseconds / (1000 * 60 * 60);

  const totalPrice = Math.ceil(durationInHours) * court.pricePerHour;

  const booking = await db.booking.create({
    data: {
      userId: user.id,
      courtId: court.id,
      startTime,
      endTime,
      totalPrice,
    },
  });

  return c.json(
    {
      ...booking,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    },
    201,
  );
});
