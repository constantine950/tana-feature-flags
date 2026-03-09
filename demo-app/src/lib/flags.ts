import { TanaClient } from "../../../sdk/src";

const API_KEY =
  import.meta.env.VITE_TANA_API_KEY ||
  "ffk_prod_13009775ce966236bee0dfa9c49acb1b";

export const flagsClient = new TanaClient({
  apiKey: API_KEY,
  apiUrl:
    import.meta.env.VITE_API_URL || "https://tana-feature-flags.onrender.com",
  cacheEnabled: true,
  cacheTTL: 60000,
});

export const FLAGS = {
  DARK_MODE: "dark_mode",
  NEW_CHECKOUT: "new_checkout",
  PREMIUM_BADGE: "premium_badge",
  DISCOUNT_BANNER: "discount_banner",
} as const;
