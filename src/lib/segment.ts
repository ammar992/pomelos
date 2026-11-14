/**
 * Word segmentation for animated headings. Uses Intl.Segmenter, which handles Chinese
 * (no spaces between words). Call on the SERVER only and pass the result to client
 * components, so ICU differences between Node and browsers can't cause hydration mismatches.
 */
export function segmentWords(text: string, locale?: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(locale, { granularity: "word" });
    const out: string[] = [];
    for (const s of seg.segment(text)) {
      // Attach whitespace/punctuation to the previous token so lines break naturally.
      if (!s.isWordLike && out.length) out[out.length - 1] += s.segment;
      else out.push(s.segment);
    }
    return out;
  }
  return text.split(/(?<=\s)/);
}
