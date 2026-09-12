import z from "zod";

export const CourtSchema = z.object({
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
});

export const CourtsSchema = z.array(CourtSchema);

export const CourtSlugParamSchema = z.object({
  slug: z.string(),
});
