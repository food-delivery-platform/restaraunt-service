export type RestaurantEntity = {
  id: string;
  owner_id: string;
  address_id: string;
  venue_type: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  cuisine_tags: string[];
  is_open: boolean;
  rating?: string | number | null;
  image_url?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
