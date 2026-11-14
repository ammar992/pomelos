/**
 * Pomelos business configuration — taken from the original website (pomelos.com.tw).
 * Only facts published on the original site are used. No phone number, street address
 * or social profiles exist on the original site, so none are shown.
 */
export const siteConfig = {
  name: "Pomelos",
  tagline: "Sourcing & Sales",
  /** Production origin, no trailing slash. Override with NEXT_PUBLIC_SITE_URL. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pomelos.com.tw").replace(/\/$/, ""),
  /** The only contact channel published on the original website. */
  email: "Business@pomelos.com.tw",
  country: "Taiwan",
} as const;

/**
 * Services — each one traces back to wording on the original website:
 * - "source quality products in Taiwan" / "finding the right products"
 * - "sourcing materials and manufacturing"
 * - "we take care of your production" / "help you to create products designed to last"
 * - "Sourcing & Sales" / "import goods to your country without any problems"
 * - "arranging for their shipment" / "final delivery in the destination country"
 * - "we also take care of your after-sales service"
 */
export const serviceSlugs = [
  "product-sourcing",
  "supplier-coordination",
  "manufacturing-support",
  "sales-support",
  "shipping-delivery",
  "after-sales",
] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];
