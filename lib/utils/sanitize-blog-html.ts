import sanitizeHtml from "sanitize-html";
import { stripHtmlToText } from "@/lib/utils/extract-html-meta";

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "u",
  "s",
  "del",
  "a",
  "img",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "code",
  "pre",
  "br",
  "hr",
  "div",
  "span",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "class", "id"],
  th: ["colspan", "rowspan", "class", "id"],
  td: ["colspan", "rowspan", "class", "id"],
  "*": ["class", "id"],
};

function isExternalHref(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  );
}

function slugifyHeadingText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Add stable id attributes to headings for table-of-contents anchors.
 */
export function addHeadingIdsToHtml(html: string): string {
  if (!html || !html.trim()) {
    return "";
  }

  const usedIds = new Map<string, number>();

  return html.replace(
    /<(h[1-6])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs = "", inner: string) => {
      if (/\bid\s*=/.test(attrs)) {
        return match;
      }

      const text = stripHtmlToText(inner);
      if (!text) {
        return match;
      }

      const baseId = slugifyHeadingText(text) || "section";
      const count = usedIds.get(baseId) ?? 0;
      usedIds.set(baseId, count + 1);
      const id = count === 0 ? baseId : `${baseId}-${count + 1}`;

      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    }
  );
}

/**
 * Sanitize blog post HTML before storage or render.
 * Uses sanitize-html (no jsdom) so server actions work on Vercel.
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html || !html.trim()) {
    return "";
  }

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    disallowedTagsMode: "discard",
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href?.trim() ?? "";
        if (!href || href.toLowerCase().startsWith("javascript:")) {
          const { href: _href, target: _target, rel: _rel, ...rest } = attribs;
          return { tagName, attribs: rest };
        }

        if (isExternalHref(href)) {
          return {
            tagName,
            attribs: {
              ...attribs,
              target: "_blank",
              rel: "noopener noreferrer",
            },
          };
        }

        const { target: _target, rel: _rel, ...rest } = attribs;
        return { tagName, attribs: rest };
      },
      img: (tagName, attribs) => {
        const src = attribs.src?.trim() ?? "";
        if (src.toLowerCase().startsWith("javascript:")) {
          const { src: _src, ...rest } = attribs;
          return { tagName, attribs: rest };
        }
        return { tagName, attribs };
      },
    },
  });
}
