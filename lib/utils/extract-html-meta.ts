import { siteConfig } from "@/lib/seo";

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCharCode(n) : "";
    });
}

/**
 * Read a HTML attribute value from a raw tag string.
 * Supports double quotes, single quotes, and unquoted values.
 */
export function getHtmlAttribute(
  tag: string,
  name: string
): string | undefined {
  const quoted = tag.match(
    new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i")
  );
  if (quoted) {
    return decodeBasicEntities(quoted[1]);
  }

  const unquoted = tag.match(
    new RegExp(`${name}\\s*=\\s*([^\\s>]+)`, "i")
  );
  if (unquoted) {
    return decodeBasicEntities(unquoted[1]);
  }

  // Present with no value, e.g. alt in broken markup
  if (new RegExp(`(?:\\s|/)${name}(?:\\s|/|>)`, "i").test(` ${tag}`)) {
    return "";
  }

  return undefined;
}

function getSiteHosts(): string[] {
  try {
    const host = new URL(siteConfig.url).hostname.replace(/^www\./i, "");
    return [host, `www.${host}`, "localhost", "127.0.0.1"];
  } catch {
    return ["bokkiecleaning.co.za", "www.bokkiecleaning.co.za", "localhost", "127.0.0.1"];
  }
}

export function isInternalHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("javascript:") ||
    lower.startsWith("#")
  ) {
    return false;
  }

  // Root-relative and path-relative links
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../") ||
    trimmed.startsWith("?")
  ) {
    return true;
  }

  try {
    const url = new URL(trimmed, siteConfig.url);
    const host = url.hostname.toLowerCase();
    return getSiteHosts().some((allowed) => host === allowed.toLowerCase());
  } catch {
    // Bare paths like "blog/post" without leading slash — treat as internal
    if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      return true;
    }
    return false;
  }
}

export function extractImagesFromHtml(
  html: string
): Array<{ alt?: string; src?: string }> {
  if (!html) return [];

  const images: Array<{ alt?: string; src?: string }> = [];
  // Allow attributes to span newlines; stop at the first closing >
  const matches = html.matchAll(/<img\b[\s\S]*?>/gi);

  for (const match of matches) {
    const tag = match[0];
    const alt = getHtmlAttribute(tag, "alt");
    const src =
      getHtmlAttribute(tag, "src") ||
      getHtmlAttribute(tag, "data-src") ||
      getHtmlAttribute(tag, "data-lazy-src");

    images.push({
      alt: alt !== undefined ? alt : undefined,
      src: src || undefined,
    });
  }

  // Markdown images that may still be in the body
  const markdownMatches = html.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g);
  for (const match of markdownMatches) {
    images.push({ alt: match[1] || undefined, src: match[2] || undefined });
  }

  return images;
}

/** Only real <img> tags (excludes markdown image syntax). */
export function extractHtmlImgTags(
  html: string
): Array<{ alt?: string; src?: string }> {
  if (!html) return [];

  const images: Array<{ alt?: string; src?: string }> = [];
  const matches = html.matchAll(/<img\b[\s\S]*?>/gi);

  for (const match of matches) {
    const tag = match[0];
    images.push({
      alt: getHtmlAttribute(tag, "alt"),
      src:
        getHtmlAttribute(tag, "src") ||
        getHtmlAttribute(tag, "data-src") ||
        getHtmlAttribute(tag, "data-lazy-src") ||
        undefined,
    });
  }

  return images;
}

/**
 * Set or replace the alt attribute on the Nth <img> tag in HTML (0-based).
 */
export function setImageAltAtIndex(
  html: string,
  index: number,
  alt: string
): string {
  if (!html || index < 0) return html;

  const safeAlt = alt
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  let current = -1;
  return html.replace(/<img\b[\s\S]*?>/gi, (tag) => {
    current += 1;
    if (current !== index) return tag;

    if (/\salt\s*=/i.test(tag)) {
      return tag
        .replace(/\salt\s*=\s*"[^"]*"/i, ` alt="${safeAlt}"`)
        .replace(/\salt\s*=\s*'[^']*'/i, ` alt="${safeAlt}"`)
        .replace(/\salt\s*=\s*[^\s>]+/i, ` alt="${safeAlt}"`);
    }

    return tag.replace(/\s*(\/?)\s*>$/, ` alt="${safeAlt}"$1>`);
  });
}

export function extractLinksFromHtml(html: string): {
  internal: string[];
  external: string[];
} {
  const internal: string[] = [];
  const external: string[] = [];
  if (!html) return { internal, external };

  const matches = html.matchAll(/<a\b[\s\S]*?>/gi);

  for (const match of matches) {
    const tag = match[0];
    const href = getHtmlAttribute(tag, "href")?.trim();
    if (!href) continue;

    const lower = href.toLowerCase();
    if (
      lower.startsWith("mailto:") ||
      lower.startsWith("tel:") ||
      lower.startsWith("javascript:") ||
      lower === "#" ||
      lower.startsWith("#")
    ) {
      continue;
    }

    if (isInternalHref(href)) {
      internal.push(href);
    } else {
      external.push(href);
    }
  }

  return { internal, external };
}

export function stripHtmlToText(html: string): string {
  if (typeof html !== "string") {
    return "";
  }

  return decodeBasicEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function countWordsInHtml(html: string): number {
  const text = stripHtmlToText(html ?? "");
  if (!text) return 0;
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

export function hasMeaningfulHtmlContent(
  html: string | undefined | null
): boolean {
  return stripHtmlToText(html ?? "").length > 0;
}

export function normalizeOptionalText(
  value: string | null | undefined
): string {
  if (!value || value === "undefined") {
    return "";
  }

  return value;
}
