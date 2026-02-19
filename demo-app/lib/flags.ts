import { TanaClient } from "../../sdk/src";

const API_KEY =
  process.env.NEXT_PUBLIC_TANA_API_KEY ||
  "ffk_dev_4e653ac915426e97bc6894fe7fc6e2c9";

export const flagsClient = new TanaClient({
  apiKey: API_KEY,
  apiUrl: "http://localhost:3000",
  cacheEnabled: true,
  cacheTTL: 60000,
});

export const FLAGS = {
  DARK_MODE: "dark_mode",
  NEW_CHECKOUT: "new_checkout",
  PREMIUM_BADGE: "premium_badge",
  DISCOUNT_BANNER: "discount_banner",
} as const;
