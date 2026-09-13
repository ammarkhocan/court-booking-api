import { z } from "@hono/zod-openapi";

export const CourtSchema = z.object({
  id: z.string().openapi({
    example: "01K6XYZABC9876543210QWERTY",
  }),

  name: z.string().openapi({
    example: "Jakarta Sport Arena",
  }),

  slug: z.string().openapi({
    example: "jakarta-sport-arena",
  }),

  description: z.string().openapi({
    example:
      "Lapangan olahraga indoor dengan fasilitas lengkap dan area tunggu yang nyaman.",
  }),

  sportType: z.string().openapi({
    example: "Basket",
  }),

  location: z.string().openapi({
    example: "Jl. Gatot Subroto No. 25, Jakarta Selatan",
  }),

  pricePerHour: z.number().int().openapi({
    example: 100000,
  }),

  imageUrl: z.url().openapi({
    example: "https://images.com/photo-1626",
  }),

  createdAt: z.string().datetime().openapi({
    example: "2026-08-20T08:30:00.000Z",
  }),

  updatedAt: z.string().datetime().openapi({
    example: "2026-08-22T10:15:00.000Z",
  }),
});

export const CourtsSchema = z.array(CourtSchema);

export const CourtSlugParamSchema = z.object({
  slug: z.string(),
});

export const CourtIdParamSchema = z.object({
  id: z.string().openapi({
    param: {
      name: "id",
      in: "path",
    },
    example: "01K5ABCDEF1234567890ABCDE",
  }),
});

export const ErrorSchema = z.object({
  message: z.string(),
});

export const AvailabilityQuerySchema = z.object({
  date: z.string(),
});

export const AvailabilityBookingSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const CourtAvailabilitySchema = z.object({
  courtId: z.string(),
  date: z.string(),
  bookedSlots: z.array(AvailabilityBookingSchema),
});
