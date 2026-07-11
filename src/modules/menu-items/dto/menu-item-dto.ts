import type { z } from "zod";

import type { menuItemDtoSchema } from "../schemas/menu-item-schema";

export type MenuItemDto = z.infer<typeof menuItemDtoSchema>;
