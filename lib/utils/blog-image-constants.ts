export const BLOG_IMAGE_BUCKET = "blog-images";

export const BLOG_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const BLOG_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const BLOG_IMAGE_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export const BLOG_IMAGE_MAX_DIMENSION = 1920;

export const BLOG_IMAGE_WEBP_QUALITY = 0.85;
