import type {
  AddRestaurantRequestDto,
  EditRestaurantRequestDto,
} from "../dto/restaurant-rest-dto";
import type { RestaurantDto } from "../dto/restaurant-dto";

export interface RestaurantService {
  getRestaurants(): Promise<RestaurantDto[]>;
  getRestaurant(id: RestaurantDto["id"]): Promise<RestaurantDto>;
  addRestaurant(request: AddRestaurantRequestDto): Promise<RestaurantDto>;
  editRestaurant(
    id: RestaurantDto["id"],
    request: EditRestaurantRequestDto,
  ): Promise<RestaurantDto>;
  restaurantExists(id: RestaurantDto["id"]): Promise<boolean>;
}
