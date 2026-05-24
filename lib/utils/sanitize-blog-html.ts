import DOMPurify from "isomorphic-dompurify";

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

const ALLOWED_ATTR = [
  "href",
  "src",
  "alt",
  "title",
  "class",
  "id",
  "colspan",
  "rowspan",
  "target",
  "rel",
];

let hooksRegistered = false;

function registerSanitizeHooks(): void {
  if (hooksRegistered) {
    return;
  }

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      const href = node.getAttribute("href")?.trim() ?? "";
      if (!href || href.toLowerCase().startsWith("javascript:")) {
        node.removeAttribute("href");
        return;
      }

      const isExternal =
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//");

      if (isExternal) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      } else {
        node.removeAttribute("target");
        node.removeAttribute("rel");
      }
    }

    if (node.tagName === "IMG") {
      const src = node.getAttribute("src")?.trim() ?? "";
      if (src.toLowerCase().startsWith("javascript:")) {
        node.removeAttribute("src");
      }
    }
  });

  hooksRegistered = true;
}

/**
 * Sanitize blog post HTML before storage or render.
 * Strips scripts, iframes, event handlers, javascript: URLs, and inline styles.
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html || !html.trim()) {
    return "";
  }

  registerSanitizeHooks();

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "style", "link", "meta"],
    FORBID_ATTR: ["style", "onerror", "onclick", "onload", "onmouseover"],
    ALLOW_DATA_ATTR: false,
  });
}
