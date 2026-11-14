/**
 * Photography used on the site. All images are from Unsplash (Unsplash License: free for
 * commercial use). Credits are shown in the footer. Replace with Pomelos's own photos of
 * real suppliers, products and shipments whenever available.
 */
export const images = {
  taipei: { src: "/images/taipei.jpg", width: 2000, height: 1333, credit: "Ethan Lin", url: "https://unsplash.com/photos/AEKdzZn_bBI" },
  factory: { src: "/images/factory.jpg", width: 2000, height: 1334, credit: "Homa Appliances", url: "https://unsplash.com/photos/pWUyHVJgLhg" },
  quality: { src: "/images/quality.jpg", width: 2000, height: 1333, credit: "Hans Westbeek", url: "https://unsplash.com/photos/_luiFaaZU6k" },
  shipping: { src: "/images/shipping.jpg", width: 2000, height: 1330, credit: "Venti Views", url: "https://unsplash.com/photos/1cqIcrWFQBI" },
  warehouse: { src: "/images/warehouse.jpg", width: 2000, height: 1331, credit: "CHUTTERSNAP", url: "https://unsplash.com/photos/BNBA1h-NgdY" },
  handshake: { src: "/images/handshake.jpg", width: 2000, height: 1335, credit: "Cytonn Photography", url: "https://unsplash.com/photos/n95VMLxqM2I" },
  harbour: { src: "/images/harbour.jpg", width: 2000, height: 1333, credit: "Johnson Hung", url: "https://unsplash.com/photos/wsvczgbQeGM" },
} as const;

export type ImageKey = keyof typeof images;
