import type { ValidateMenuItemsForOrderResponseDto } from "../modules/menu-items/dto/menu-item-validation-dto";
import { validateMenuItemsForOrderRequestDtoSchema } from "../modules/menu-items/schemas/menu-item-validation-schema";
import { menuItemService } from "../modules/menu-items/services/menu-item-service-impl";

export const handler = async (
  event: unknown,
): Promise<ValidateMenuItemsForOrderResponseDto> => {
  const request = validateMenuItemsForOrderRequestDtoSchema.parse(event);
  return menuItemService.validateMenuItemsForOrder(request);
};
