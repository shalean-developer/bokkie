import { generateSlug } from "@/lib/utils/slug-generator";
import { BLOG_IMAGE_BUCKET } from "@/lib/utils/blog-image-constants";

export function sanitizeBlogImageFilename(originalName: string): string {
  const withoutPath = originalName.split(/[/\\]/).pop() || "image";
  const withoutExt = withoutPath.replace(/\.[^.]+$/, "");
  const slug = generateSlug(withoutExt) || "image";
  return slug.slice(0, 80);
}

export function buildBlogImageStoragePath(
  originalName: string,
  extension: string
): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const timestamp = now.getTime();
  const safeName = sanitizeBlogImageFilename(originalName);
  const ext = extension.replace(/^\./, "").toLowerCase() || "webp";

  return `blog-images/${year}/${month}/${timestamp}-${safeName}.${ext}`;
}

export function getExtensionFromMime(mimeType: string): string {
  switch (mimeType.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "webp";
  }
}

export { BLOG_IMAGE_BUCKET };
