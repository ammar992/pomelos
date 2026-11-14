/**
 * Structured data as a JSON-LD data block, rendered as a plain React text child
 * (no dangerouslySetInnerHTML). Every "<" is replaced by its JSON unicode escape (backslash u003c),
 * so no value can ever close the <script> tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json">{json}</script>;
}
