import z from "zod";

export const CourtsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    sportType: z.string(),
    location: z.string(),
    pricePerHour: z.number(),
    imageUrl: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
);
