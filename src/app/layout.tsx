import type { ReactNode } from "react";

// The real root layout lives in app/[locale]/layout.tsx (it owns <html lang>).
// This pass-through exists so app/not-found.tsx can render for requests outside any locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
