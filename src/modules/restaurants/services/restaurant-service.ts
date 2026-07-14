import type {
  AddRestaurantRequestDto,
  EditRestaurantRequestDto,
} from "../dto/restaurant-rest-dto";
import type { RestaurantDto } from "../dto/restaurant-dto";

export interface RestaurantService {
  getRestaurants(): Promise<RestaurantDto[]>;
  getRestaurant(id: RestaurantDto["id"]): Promise<RestaurantDto>;
  addRestaurant(
    ownerId: RestaurantDto["ownerId"],
    request: AddRestaurantRequestDto,
  ): Promise<RestaurantDto>;
  editRestaurant(
    id: RestaurantDto["id"],
    request: EditRestaurantRequestDto,
  ): Promise<RestaurantDto>;
  restaurantExists(id: RestaurantDto["id"]): Promise<boolean>;
  restaurantBelongsToOwner(
    id: RestaurantDto["id"],
    ownerId: RestaurantDto["ownerId"],
  ): Promise<boolean>;
}
