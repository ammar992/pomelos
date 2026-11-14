import { Factory, Handshake, Headset, PackageSearch, Ship, TrendingUp, type LucideIcon } from "lucide-react";
import type { ServiceSlug } from "@/config/site";
import type { ImageKey } from "@/config/images";

export const serviceIcons: Record<ServiceSlug, LucideIcon> = {
  "product-sourcing": PackageSearch,
  "supplier-coordination": Handshake,
  "manufacturing-support": Factory,
  "sales-support": TrendingUp,
  "shipping-delivery": Ship,
  "after-sales": Headset,
};

export const serviceImages: Record<ServiceSlug, ImageKey> = {
  "product-sourcing": "taipei",
  "supplier-coordination": "handshake",
  "manufacturing-support": "quality",
  "sales-support": "harbour",
  "shipping-delivery": "shipping",
  "after-sales": "warehouse",
};
