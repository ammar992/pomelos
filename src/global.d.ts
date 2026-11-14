import type { locales } from "@/i18n/routing";
import type messages from "../messages/en.json";

// Type-safe translation keys: every `t("...")` call is checked against messages/en.json.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: typeof messages;
  }
}
