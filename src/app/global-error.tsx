"use client";

import "./globals.css";

// Last-resort boundary (root layout failed). Never renders error.message or stack —
// only the opaque digest, which maps to server logs.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-ink-950 p-6 text-center text-fg">
        <div>
          <p className="eyebrow">Error</p>
          <h1 className="mt-4 text-h2">Something went wrong.</h1>
          {error.digest ? <p className="mt-3 font-label text-sm text-muted">Reference: {error.digest}</p> : null}
          <button type="button" onClick={reset} className="btn btn-primary mt-8">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
