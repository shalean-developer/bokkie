import sanitizeHtml from "sanitize-html";

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
