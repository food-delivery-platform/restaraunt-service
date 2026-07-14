import type { JwtPayload } from "jwt-decode";

export interface RestaurantJwtPayload extends JwtPayload {
  sub: string;
  "cognito:groups": string[];
}
