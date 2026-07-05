export function extractImagesFromHtml(
  html: string
): Array<{ alt?: string }> {
  const images: Array<{ alt?: string }> = [];
  const matches = html.matchAll(/<img[^>]*>/gi);

  for (const match of matches) {
    const tag = match[0];
    const altMatch = tag.match(/alt=["']([^"']*)["']/i);
    images.push({ alt: altMatch ? altMatch[1] : undefined });
  }

  return images;
}

export function extractLinksFromHtml(html: string): {
  internal: string[];
  external: string[];
} {
  const internal: string[] = [];
  const external: string[] = [];
  const matches = html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi);

  for (const match of matches) {
    const href = match[1].trim();
    if (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("//")
    ) {
      external.push(href);
    } else if (href && !href.startsWith("javascript:")) {
      internal.push(href);
    }
  }

  return { internal, external };
}

export function stripHtmlToText(html: string): string {
  if (typeof html !== "string") {
    return "";
  }

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasMeaningfulHtmlContent(html: string | undefined | null): boolean {
  return stripHtmlToText(html ?? "").length > 0;
}

export function normalizeOptionalText(value: string | null | undefined): string {
  if (!value || value === "undefined") {
    return "";
  }

  return value;
}
