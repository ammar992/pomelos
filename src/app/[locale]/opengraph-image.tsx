import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = "Pomelos — Sourcing and Sales in Taiwan for Global Businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Latin-only text: the built-in OG font has no CJK glyphs. Localized titles and
// descriptions are still provided per locale through page metadata.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "radial-gradient(circle at 78% 48%, #24406e 0%, #0e1729 36%, #0a1120 66%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            alignSelf: "flex-start",
            padding: "14px 34px",
            borderRadius: 999,
            background: "#CB0505",
            border: "4px solid #FBFAF2",
            color: "#FBFAF2",
          }}
        >
          <div style={{ fontSize: 46, fontWeight: 700 }}>{`${siteConfig.name}.`}</div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>{siteConfig.tagline}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#F2C46D", letterSpacing: 4, textTransform: "uppercase" }}>Taiwan · Worldwide</div>
          <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.04, marginTop: 18, maxWidth: 900 }}>
            Connecting Taiwan to Global Opportunities.
          </div>
        </div>
        <div style={{ display: "flex", gap: 26, fontSize: 24, color: "#AEB6C6" }}>
          <span>Product sourcing</span>
          <span>·</span>
          <span>Manufacturing</span>
          <span>·</span>
          <span>Shipping</span>
          <span>·</span>
          <span>After-sales</span>
        </div>
      </div>
    ),
    size,
  );
}
