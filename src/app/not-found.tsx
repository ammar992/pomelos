import Link from "next/link";
import "./globals.css";

// Fallback for requests that never matched a locale (rare: the proxy routes nearly everything).
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-ink-950 p-6 text-center text-fg">
        <div>
          <p className="eyebrow">404</p>
          <h1 className="mt-4 text-h2">Page not found</h1>
          <Link href="/" className="btn btn-primary mt-8">
            Return home
          </Link>
        </div>
      </body>
    </html>
  );
}
