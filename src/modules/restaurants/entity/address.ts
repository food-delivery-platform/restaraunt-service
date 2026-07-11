export type AddressEntity = {
  id: string;
  user_id: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  district?: string | null;
  postal_code?: string | null;
  country: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  is_default: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};
