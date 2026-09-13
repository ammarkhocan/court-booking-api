import { z } from "@hono/zod-openapi";

export const CreateBookingSchema = z.object({
  courtId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const BookingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  courtId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(["CONFIRMED", "CANCELLED"]),
  totalPrice: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ErrorSchema = z.object({
  message: z.string(),
});
