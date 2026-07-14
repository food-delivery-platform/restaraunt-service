import { z } from "zod";

import { idSchema } from "../../../shared/schemas/http-schema";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,6})?)?$/, {
    message: "Time must use PostgreSQL time format",
  });

export const venueOpeningHourDtoSchema = z.object({
  id: idSchema,
  dayOfWeek: z.number().int().min(1).max(7),
  opensAt: timeSchema,
  closesAt: timeSchema,
});

export const addressDtoSchema = z.object({
  id: idSchema,
  userId: idSchema,
  label: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const restaurantDtoSchema = z.object({
  id: idSchema,
  ownerId: idSchema,
  addressId: idSchema,
  address: addressDtoSchema,
  venueType: z.string().min(1),

  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  cuisineTags: z.array(z.string()),

  isOpen: z.boolean(),
  rating: z.number().min(0).max(5).optional(),
  imageUrl: z.string().url().optional(),
  openingHours: z.array(venueOpeningHourDtoSchema),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
