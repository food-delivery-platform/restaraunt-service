import { z } from "zod";

export const idSchema = z.string().uuid();

export const idPathParametersSchema = z.object({
  id: idSchema,
});
