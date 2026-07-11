import { randomUUID } from "node:crypto";

import type { Knex } from "knex";

import { db } from "../../../db/knex";
import { NotFoundError } from "../../../shared/http";
import { firstOrThrow } from "../../../shared/utils";
import type {
  AddRestaurantRequestDto,
  EditRestaurantRequestDto,
} from "../dto/restaurant-rest-dto";
import type { RestaurantDto } from "../dto/restaurant-dto";
import type { AddressEntity } from "../entity/address";
import type { RestaurantEntity } from "../entity/restaurant";
import type { VenueOpeningHourEntity } from "../entity/venue-opening-hour";
import type { RestaurantService } from "./restaurant-service";

class RestaurantServiceImpl implements RestaurantService {
  public constructor(private readonly db: Knex) {}

  public async getRestaurants(): Promise<RestaurantDto[]> {
    const rows = await this.db<RestaurantEntity>("venues")
      .select("*")
      .orderBy("created_at", "desc");

    const hoursByVenue = await this.getOpeningHoursByVenueIds(
      rows.map((row) => row.id),
    );
    const addressesById = await this.getAddressesByIds(
      rows.map((row) => row.address_id),
    );

    return rows.map((row) =>
      toRestaurantDto(
        row,
        getAddressOrThrow(addressesById, row.address_id),
        hoursByVenue.get(row.id) ?? [],
      ),
    );
  }

  public async getRestaurant(id: RestaurantDto["id"]): Promise<RestaurantDto> {
    const row = await this.db<RestaurantEntity>("venues")
      .select("*")
      .where({ id })
      .first();

    if (row === undefined) {
      throw new NotFoundError("Restaurant not found");
    }

    const hoursByVenue = await this.getOpeningHoursByVenueIds([row.id]);
    const addressesById = await this.getAddressesByIds([row.address_id]);

    return toRestaurantDto(
      row,
      getAddressOrThrow(addressesById, row.address_id),
      hoursByVenue.get(row.id) ?? [],
    );
  }

  public async addRestaurant(
    request: AddRestaurantRequestDto,
  ): Promise<RestaurantDto> {
    const now = new Date();
    const row = await this.db<RestaurantEntity>("venues")
      .insert({
        id: randomUUID(),
        owner_id: request.ownerId,
        address_id: request.addressId,
        venue_type: request.venueType,
        name: request.name,
        is_open: request.isOpen ?? true,
        cuisine_tags: request.cuisineTags ?? [],
        created_at: now,
        updated_at: now,
        ...(request.slug !== undefined ? { slug: request.slug } : {}),
        ...(request.description !== undefined
          ? { description: request.description }
          : {}),
        ...(request.imageUrl !== undefined
          ? { image_url: request.imageUrl }
          : {}),
      })
      .returning("*")
      .then((rows) => firstOrThrow(rows, "Expected inserted restaurant row"));

    return this.getRestaurant(row.id);
  }

  public async editRestaurant(
    id: RestaurantDto["id"],
    request: EditRestaurantRequestDto,
  ): Promise<RestaurantDto> {
    const patch = {
      updated_at: new Date(),
      ...(request.name !== undefined ? { name: request.name } : {}),
      ...(request.slug !== undefined ? { slug: request.slug } : {}),
      ...(request.description !== undefined
        ? { description: request.description }
        : {}),
      ...(request.venueType !== undefined
        ? { venue_type: request.venueType }
        : {}),
      ...(request.cuisineTags !== undefined
        ? { cuisine_tags: request.cuisineTags }
        : {}),
      ...(request.isOpen !== undefined ? { is_open: request.isOpen } : {}),
      ...(request.imageUrl !== undefined
        ? { image_url: request.imageUrl }
        : {}),
    };

    const row = await this.db<RestaurantEntity>("venues")
      .where({ id })
      .update(patch)
      .returning("*")
      .then(firstOrNotFound);

    const hoursByVenue = await this.getOpeningHoursByVenueIds([row.id]);
    const addressesById = await this.getAddressesByIds([row.address_id]);

    return toRestaurantDto(
      row,
      getAddressOrThrow(addressesById, row.address_id),
      hoursByVenue.get(row.id) ?? [],
    );
  }

  public async restaurantExists(id: RestaurantDto["id"]): Promise<boolean> {
    const row = await this.db<RestaurantEntity>("venues")
      .select("id")
      .where({ id })
      .first();

    return row !== undefined;
  }

  private async getOpeningHoursByVenueIds(
    venueIds: RestaurantDto["id"][],
  ): Promise<Map<string, VenueOpeningHourEntity[]>> {
    if (venueIds.length === 0) {
      return new Map();
    }

    const rows = await this.db<VenueOpeningHourEntity>("venue_opening_hours")
      .select("id", "venue_id", "day_of_week", "opens_at", "closes_at")
      .whereIn("venue_id", venueIds)
      .orderBy("day_of_week", "asc")
      .orderBy("opens_at", "asc");

    const hoursByVenue = new Map<string, VenueOpeningHourEntity[]>();
    for (const row of rows) {
      const hours = hoursByVenue.get(row.venue_id) ?? [];
      hours.push(row);
      hoursByVenue.set(row.venue_id, hours);
    }

    return hoursByVenue;
  }

  private async getAddressesByIds(
    addressIds: RestaurantDto["addressId"][],
  ): Promise<Map<string, AddressEntity>> {
    if (addressIds.length === 0) {
      return new Map();
    }

    const rows = await this.db<AddressEntity>("addresses")
      .select("*")
      .whereIn("id", addressIds);

    return new Map(rows.map((row) => [row.id, row]));
  }
}

const toRestaurantDto = (
  row: RestaurantEntity,
  address: AddressEntity,
  openingHours: VenueOpeningHourEntity[],
): RestaurantDto => ({
  id: row.id,
  ownerId: row.owner_id,
  addressId: row.address_id,
  address: {
    id: address.id,
    userId: address.user_id,
    line1: address.line1,
    city: address.city,
    country: address.country,
    isDefault: address.is_default,
    createdAt: toIsoString(address.created_at),
    updatedAt: toIsoString(address.updated_at),
    ...(address.label != null ? { label: address.label } : {}),
    ...(address.line2 != null ? { line2: address.line2 } : {}),
    ...(address.district != null ? { district: address.district } : {}),
    ...(address.postal_code != null ? { postalCode: address.postal_code } : {}),
    ...(address.latitude != null ? { latitude: Number(address.latitude) } : {}),
    ...(address.longitude != null
      ? { longitude: Number(address.longitude) }
      : {}),
  },
  venueType: row.venue_type,
  name: row.name,
  cuisineTags: row.cuisine_tags,
  isOpen: row.is_open,
  openingHours: openingHours.map((hours) => ({
    id: hours.id,
    dayOfWeek: hours.day_of_week,
    opensAt: hours.opens_at,
    closesAt: hours.closes_at,
  })),
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
  ...(row.slug !== null && row.slug !== undefined ? { slug: row.slug } : {}),
  ...(row.description !== null && row.description !== undefined
    ? { description: row.description }
    : {}),
  ...(row.rating !== null && row.rating !== undefined
    ? { rating: Number(row.rating) }
    : {}),
  ...(row.image_url !== null && row.image_url !== undefined
    ? { imageUrl: row.image_url }
    : {}),
});

const getAddressOrThrow = (
  addressesById: Map<string, AddressEntity>,
  addressId: string,
): AddressEntity => {
  const address = addressesById.get(addressId);
  if (address === undefined) {
    throw new NotFoundError("Venue address not found");
  }

  return address;
};

const firstOrNotFound = <T>(rows: T[]): T => {
  const row = rows[0];
  if (row === undefined) {
    throw new NotFoundError("Restaurant not found");
  }

  return row;
};

const toIsoString = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

export const restaurantService: RestaurantService = new RestaurantServiceImpl(
  db,
);
