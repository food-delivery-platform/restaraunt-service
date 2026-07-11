import type { z } from "zod";

import type { restaurantDtoSchema } from "../schemas/restaurant-schema";

export type RestaurantDto = z.infer<typeof restaurantDtoSchema>;
