import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "../../lib/db";
import { checkAuthorized } from "../auth/middleware";
import type { AuthEnv } from "../auth/middleware";
import {
  BookingSchema,
  BookingsSchema,
  CreateBookingSchema,
  BookingIdParamSchema,
  ErrorSchema,
} from "./schema";

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

const getBookingsRoute = createRoute({
  method: "get",
  path: "/",
  middleware: [checkAuthorized] as const,
  responses: {
    200: {
      description: "Get current user booking history",
      content: {
        "application/json": {
          schema: BookingsSchema,
        },
      },
    },
  },
});

const getBookingByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  middleware: [checkAuthorized] as const,
  request: {
    params: BookingIdParamSchema,
  },
  responses: {
    200: {
      description: "Get booking by id",
      content: {
        "application/json": {
          schema: BookingSchema,
        },
      },
    },
    404: {
      description: "Booking not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

const cancelBookingRoute = createRoute({
  method: "patch",
  path: "/{id}/cancel",
  middleware: [checkAuthorized] as const,
  request: {
    params: BookingIdParamSchema,
  },
  responses: {
    200: {
      description: "Booking cancelled successfully",
      content: {
        "application/json": {
          schema: BookingSchema,
        },
      },
    },
    400: {
      description: "Booking already cancelled",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Booking not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

bookingsRoute.openapi(cancelBookingRoute, async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");

  const booking = await db.booking.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!booking) {
    return c.json(
      {
        message: "Booking not found",
      },
      404,
    );
  }

  if (booking.status === "CANCELLED") {
    return c.json(
      {
        message: "Booking is already cancelled",
      },
      400,
    );
  }

  const cancelledBooking = await db.booking.update({
    where: {
      id: booking.id,
    },
    data: {
      status: "CANCELLED",
    },
  });

  return c.json(
    {
      ...cancelledBooking,
      startTime: cancelledBooking.startTime.toISOString(),
      endTime: cancelledBooking.endTime.toISOString(),
      createdAt: cancelledBooking.createdAt.toISOString(),
      updatedAt: cancelledBooking.updatedAt.toISOString(),
    },
    200,
  );
});

bookingsRoute.openapi(getBookingByIdRoute, async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");

  const booking = await db.booking.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!booking) {
    return c.json(
      {
        message: "Booking not found",
      },
      404,
    );
  }

  return c.json(
    {
      ...booking,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    },
    200,
  );
});

bookingsRoute.openapi(getBookingsRoute, async (c) => {
  const user = c.get("user");

  const bookings = await db.booking.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return c.json(
    bookings.map((booking) => ({
      ...booking,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    })),
    200,
  );
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
