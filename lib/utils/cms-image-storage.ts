import { generateSlug } from "@/lib/utils/slug-generator";
import { BLOG_IMAGE_BUCKET } from "@/lib/utils/blog-image-constants";

export function buildCmsImageStoragePath(
  originalName: string,
  extension: string
): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const timestamp = now.getTime();
  const withoutPath = originalName.split(/[/\\]/).pop() || "image";
  const withoutExt = withoutPath.replace(/\.[^.]+$/, "");
  const safeName = (generateSlug(withoutExt) || "image").slice(0, 80);
  const ext = extension.replace(/^\./, "").toLowerCase() || "webp";

  return `cms-images/${year}/${month}/${timestamp}-${safeName}.${ext}`;
}

export { BLOG_IMAGE_BUCKET as CMS_IMAGE_BUCKET };
