# MenuService External DTOs

This document describes DTOs used for communication between MenuService and external services/frontends.

MenuService stores menu items in Supabase. The `price` is serialized as a string to avoid floating-point precision issues, for example `"12.99"`.

## PostgreSQL credentials

In production, set `AWS_DB_SECRET_ARN` to the ARN of an AWS Secrets Manager
secret and set `AWS_REGION`. Both settings are required. The secret must
contain:

```json
{
  "RESTAURANT_DB_URL": "postgresql://user:password@host:5432/database"
}
```

The application role needs `secretsmanager:GetSecretValue` for that secret and,
when a customer-managed KMS key is used, `kms:Decrypt` for the key. The secret is
retrieved once and cached for the lifetime of the process.

## REST API Summary

- `GET /restaurants` - Get all restaurants
- `GET /restaurants/{id}` - Get restaurant by ID
- `POST /restaurants` - Add restaurant
- `PATCH /restaurants/{id}` - Edit restaurant

- `GET /categories?restaurantId={restaurantId}` - Get categories by restaurant
- `POST /categories` - Add category
- `POST /categories/batch` - Add categories

- `GET /menu-items/{id}` — Get menu item by ID
- `GET /menu-items?restaurantId={restaurantId}` — Get available menu items by restaurant
- `POST /menu-items/by-ids` — Get menu items by IDs
- `POST /menu-items/validate` — Validate menu items for order creation
- `POST /menu-items` — Add menu item
- `PATCH /menu-items/{id}` — Edit menu item

## MenuItemDto

Used when MenuService returns menu item data to other services or frontends.

```typescript
export type MenuItemDto = {
  id: string;
  restaurantId: string;

  name: string;
  description?: string;
  category?: {
    id: string;
    restaurantId: string;
    name: string;
  };

  price: string; // Serialized as string, example: "12.99"
  currency: string;

  isAvailable: boolean;

  ingredients?: string[];
  allergens?: string[];

  labels?: {
    spicy?: boolean;
    vegetarian?: boolean;
    vegan?: boolean;
    kosher?: boolean;
    glutenFree?: boolean;
    lactoseFree?: boolean;
    halal?: boolean;
  };

  portion?: {
    weightGrams?: number;
    volumeMl?: number;
    pieces?: number;
    description?: string;
  };

  spicyLevel?: 0 | 1 | 2 | 3;

  nutrition?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
};
```

## CategoryDto

Used when MenuService returns menu item category data.

```typescript
export type CategoryDto = {
  id: string;
  restaurantId: string;
  name: string;
};
```

## RestaurantDto

Used when MenuService returns restaurant data to other services or frontends.

`venueType` and `cuisineTags` are intentionally not part of this DTO.

```typescript
export type RestaurantDto = {
  id: string;
  ownerId: string;
  addressId: string;

  name: string;
  slug?: string;
  description?: string;

  isOpen: boolean;
  rating?: number; // 0-5
  imageUrl?: string;

  createdAt: string;
  updatedAt: string;
};
```

## Get All Restaurants

Used to retrieve all restaurants.

- **REST method:** `GET`
- **Endpoint:** `/restaurants`
- **Response body:** `GetRestaurantsResponseDto`
- **HTTP statuses:**
  - `200 OK` on success

### Response

```typescript
export type GetRestaurantsResponseDto = {
  restaurants: RestaurantDto[];
};
```

## Get Restaurant by ID

Used to retrieve one restaurant.

- **REST method:** `GET`
- **Endpoint:** `/restaurants/{id}`
- **Path parameter:** `id` — restaurant ID
- **Response body:** `GetRestaurantResponseDto`
- **HTTP statuses:**
  - `200 OK` on success
  - `404 Not Found` when the restaurant does not exist

### Response

```typescript
export type GetRestaurantResponseDto = {
  restaurant: RestaurantDto & {
    categories: CategoryDto[];
    menuItems: MenuItemDto[];
  };
};
```

## Add Restaurant

Used to add a new restaurant.

- **REST method:** `POST`
- **Endpoint:** `/restaurants`
- **Request body:** `AddRestaurantRequestDto`
- **Response body:** `AddRestaurantResponseDto`
- **HTTP statuses:**
  - `201 Created` on success
  - `400 Bad Request` for validation errors
  - `401 Unauthorized` when no token provided
  - `403 Forbidden` when the owner is not allowed
  - `404 Not Found` when the address does not exist

### Request

```typescript
export type AddRestaurantRequestDto = {
  ownerId: string;
  addressId: string;

  name: string;
  slug?: string;
  description?: string;

  isOpen?: boolean;
  imageUrl?: string;
};
```

### Response

```typescript
export type AddRestaurantResponseDto = {
  restaurant: RestaurantDto;
};
```

## Edit Restaurant

Used to update restaurant details.

- **REST method:** `PATCH`
- **Endpoint:** `/restaurants/{id}`
- **Path parameter:** `id` — restaurant ID
- **Request body:** `EditRestaurantRequestDto`
- **Response body:** `EditRestaurantResponseDto`
- **HTTP statuses:**
  - `200 OK` on success
  - `400 Bad Request` for invalid input
  - `401 Unauthorized` when no token provided
  - `403 Forbidden` when the restaurant is not allowed
  - `404 Not Found` when the restaurant does not exist

### Request

```typescript
export type EditRestaurantRequestDto = {
  name?: string;
  slug?: string;
  description?: string;

  isOpen?: boolean;
  imageUrl?: string;
};
```

### Response

```typescript
export type EditRestaurantResponseDto = {
  restaurant: RestaurantDto;
};
```

## Get Menu Item by ID

Used to retrieve a single menu item by its ID.

- **REST method:** `GET`
- **Endpoint:** `/menu-items/{id}`
- **Path parameter:** `id` — menu item ID
- **Response body:** `MenuItemDto`
- **HTTP statuses:**
  - `200 OK` on success
  - `404 Not Found` when the item does not exist

### Response

Response body is `MenuItemDto`

## Get Available Menu Items by Restaurant ID

Used by Customer App to display available menu items for a selected restaurant.

- **REST method:** `GET`
- **Endpoint:** `/menu-items`
- **Request:** query parameter `restaurantId` and optional query parameter `available`
- **Response body:** `GetMenuItemsByRestaurantResponseDto`
- **HTTP statuses:**
  - `200 OK` on success
  - `400 Bad Request` for invalid query values

### Request

- **Query parameter:** `restaurantId`
- **Query parameter:** `available?: true`

### Response

```typescript
export type GetMenuItemsByRestaurantResponseDto = {
  restaurantId: string;
  items: MenuItemDto[];
};
```

## Get Menu Item Categories by Restaurant ID

Used by Restaurant App and Customer App to display categories for a selected restaurant.

- **REST method:** `GET`
- **Endpoint:** `/categories`
- **Query parameter:** `restaurantId`
- **Response body:** `GetCategoriesByRestaurantResponseDto`
- **HTTP statuses:**
  - `200 OK` on success

### Response

```typescript
export type GetCategoriesByRestaurantResponseDto = {
  restaurantId: string;
  categories: CategoryDto[];
};
```

## Get Menu Items by IDs

Used by Customer App when the user opens the cart.

MenuService returns only items that still exist and are available.

- **REST method:** `POST`
- **Endpoint:** `/menu-items/by-ids`
- **Request body:** `GetMenuItemsByIdsRequestDto`
- **Response body:** `GetMenuItemsByIdsResponseDto`
- **HTTP statuses:**
  - `200 OK` on success
  - `400 Bad Request` for invalid request payload

### Request

```typescript
export type GetMenuItemsByIdsRequestDto = {
  menuItemIds: string[];
};
```

### Response

```typescript
export type GetMenuItemsByIdsResponseDto = {
  items: MenuItemDto[];
  unavailableItemIds: string[]; // includes IDs for items that are missing or not available
  totalPrice: string; // sum of all available items prices
};
```

## Add Menu Item Category

Used by the Restaurant App to add a new category for a restaurant menu.

- **REST method:** `POST`
- **Endpoint:** `/categories`
- **Request body:** `AddCategoryRequestDto`
- **Response body:** `AddCategoryResponseDto`
- **HTTP statuses:**
  - `201 Created` on success
  - `400 Bad Request` for validation errors
  - `401 Unauthorized` when no token provided
  - `403 Forbidden` when the restaurant is not allowed
  - `404 Not Found` when the restaurant does not exist

### Request

```typescript
export type AddCategoryRequestDto = {
  restaurantId: string;
  name: string;
};
```

### Response

```typescript
export type AddCategoryResponseDto = {
  category: CategoryDto;
};
```

## Add Menu Item Categories

Used by the Restaurant App to add multiple categories for a restaurant menu.

- **REST method:** `POST`
- **Endpoint:** `/categories/batch`
- **Request body:** `AddCategoriesRequestDto`
- **Response body:** `AddCategoriesResponseDto`
- **HTTP statuses:**
  - `201 Created` on success
  - `400 Bad Request` for validation errors
  - `401 Unauthorized` when no token provided
  - `403 Forbidden` when the restaurant is not allowed
  - `404 Not Found` when the restaurant does not exist

### Request

```typescript
export type AddCategoriesRequestDto = {
  restaurantId: string;
  names: string[];
};
```

### Response

```typescript
export type AddCategoriesResponseDto = {
  categories: CategoryDto[];
};
```

## Add Menu Item

Used by the Restaurant App to add a new menu item for a restaurant.

- **REST method:** `POST`
- **Endpoint:** `/menu-items`
- **Request body:** `AddMenuItemRequestDto`
- **Response body:** `AddMenuItemResponseDto`
- **HTTP statuses:**
  - `201 Created` on success
  - `400 Bad Request` for validation errors
  - `401 Unauthorized` when no token provided
  - `403 Forbidden` when the restaurant is not allowed

### Request

```typescript
export type AddMenuItemRequestDto = {
  restaurantId: string;

  name: string;
  description?: string;
  category?: MenuItemDto["category"];

  price: string; // example: "12.99"
  currency: string;

  isAvailable?: boolean;

  ingredients?: string[];
  allergens?: string[];

  labels?: MenuItemDto["labels"];
  portion?: MenuItemDto["portion"];
  spicyLevel?: MenuItemDto["spicyLevel"];
  nutrition?: MenuItemDto["nutrition"];
};
```

### Response

```typescript
export type AddMenuItemResponseDto = {
  item: MenuItemDto;
};
```

## Edit Menu Item

Used by the Restaurant App to update an existing menu item.

- **REST method:** `PATCH`
- **Endpoint:** `/menu-items/{id}`
- **Path parameter:** `id` — menu item ID
- **Request body:** `EditMenuItemRequestDto`
- **Response body:** `EditMenuItemResponseDto`
- **HTTP statuses:**
  - `200 OK` on success
  - `400 Bad Request` for invalid input
  - `401 Unauthorized` when no token provided
  - `403 Forbidden` when the restaurant is not allowed
  - `404 Not Found` when the item does not exist

### Request

```typescript
export type EditMenuItemRequestDto = {
  name?: string;
  description?: string;
  category?: MenuItemDto["category"];

  price?: string; // example: "12.99"
  currency?: string;

  isAvailable?: boolean;

  ingredients?: string[];
  allergens?: string[];

  labels?: MenuItemDto["labels"];
  portion?: MenuItemDto["portion"];
  spicyLevel?: MenuItemDto["spicyLevel"];
  nutrition?: MenuItemDto["nutrition"];
};
```

### Response

```typescript
export type EditMenuItemResponseDto = {
  item: MenuItemDto;
};
```

## Validate Menu Items for Order Creation

HTTP endpoint that validates menu items for order creation before the OrderService creates an order.

- **REST method:** `POST`
- **Endpoint:** `/menu-items/validate`
- **Caller:** OrderService
- **Input:** `ValidateMenuItemsForOrderRequestDto`
- **Output:** `ValidateMenuItemsForOrderResponseDto`

MenuService checks that all selected menu items:

- exist
- belong to the selected restaurant
- are currently available
- have the expected price
- use the expected currency
- have valid quantities

### Request

```typescript
export type ValidateMenuItemsForOrderRequestDto = {
  restaurantId: string;

  items: {
    menuItemId: string;
    quantity: number;
    expectedPrice: string; // price that customer saw, example: "12.99"
    currency: string;
  }[];
};
```

### Validated Order Menu Item

```typescript
export type ValidatedOrderMenuItemDto = {
  menuItemId: string;
  restaurantId: string;

  name: string;
  quantity: number;

  price: string;
  currency: string;

  totalPrice: string;
};
```

### Response

```typescript
export type ValidateMenuItemsForOrderResponseDto = {
  valid: boolean;

  restaurantId: string;

  items: ValidatedOrderMenuItemDto[];

  totalPrice: string;
  currency: string;

  errors: MenuValidationErrorDto[];
};
```

### Validation Error

```typescript
export type MenuValidationErrorDto = {
  menuItemId?: string;

  code:
    | "ITEM_NOT_FOUND"
    | "ITEM_UNAVAILABLE"
    | "ITEM_RESTAURANT_MISMATCH"
    | "PRICE_CHANGED"
    | "INVALID_QUANTITY"
    | "CURRENCY_MISMATCH";

  message: string;

  currentPrice?: string;
  expectedPrice?: string;
};
```

## Important Notes

- ID fields are strings.
- Price is serialized as a string (e.g., `"12.99"`) to avoid floating-point precision issues.

### Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "restaurantId": "64c1a2b3-d4e5-4678-9012-345600000000",
  "name": "Spicy Chicken Ramen",
  "price": "12.99",
  "currency": "ILS",
  "category": {
    "id": "9b5f7bd2-e7cb-4f1e-b9cf-0461d9c01000",
    "restaurantId": "64c1a2b3-d4e5-4678-9012-345600000000",
    "name": "Noodles"
  },
  "isAvailable": true
}
```
