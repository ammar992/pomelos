import { Inter, Manrope, Noto_Sans_TC, Space_Grotesk } from "next/font/google";

// Fonts are self-hosted at build time by next/font: no requests to Google at runtime,
// so the CSP can keep `font-src 'self'`.
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["500", "600", "700"],
});

// CJK font is split into unicode-range slices; browsers only download the slices
// needed for the characters actually on the page. Not preloaded to protect LCP.
export const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-tc",
  display: "swap",
  weight: ["400", "500", "700"],
  preload: false,
});

export const fontVariables = [spaceGrotesk.variable, inter.variable, manrope.variable, notoSansTC.variable].join(" ");
